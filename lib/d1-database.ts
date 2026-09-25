export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[]; success: boolean; meta: any }>;
  run(): Promise<{ success: boolean; meta: any }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<any[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

// In-memory data store for tables
const tables: Map<string, Array<Record<string, any>>> = new Map();

function getTable(name: string): Array<Record<string, any>> {
  const cleanName = name.replace(/[`"]/g, '').toLowerCase();
  if (!tables.has(cleanName)) {
    tables.set(cleanName, []);
  }
  return tables.get(cleanName)!;
}

// Helper to evaluate basic conditions
function evaluateCondition(row: Record<string, any>, condition: string, boundValues: any[], valueIndexRef: { idx: number }): boolean {
  // Trim parentheses
  condition = condition.trim();
  if (condition.startsWith('(') && condition.endsWith(')')) {
    condition = condition.slice(1, -1).trim();
  }

  // Handle AND clauses
  const andParts = splitTopLevel(condition, ' AND ');
  if (andParts.length > 1) {
    return andParts.every(part => evaluateCondition(row, part, boundValues, valueIndexRef));
  }

  // Handle OR clauses
  const orParts = splitTopLevel(condition, ' OR ');
  if (orParts.length > 1) {
    return orParts.some(part => evaluateCondition(row, part, boundValues, valueIndexRef));
  }

  // Handle NOT / IS NULL / IS NOT NULL
  if (/\bIS\s+NULL\b/i.test(condition)) {
    const col = condition.replace(/\bIS\s+NULL\b/i, '').trim().replace(/[`"]/g, '');
    const val = getColVal(row, col);
    return val === null || val === undefined;
  }
  if (/\bIS\s+NOT\s+NULL\b/i.test(condition)) {
    const col = condition.replace(/\bIS\s+NOT\s+NULL\b/i, '').trim().replace(/[`"]/g, '');
    const val = getColVal(row, col);
    return val !== null && val !== undefined;
  }

  // Handle LIKE
  const likeMatch = condition.match(/^(.*?)\s+LIKE\s+(.*)$/i);
  if (likeMatch) {
    const col = likeMatch[1].trim().replace(/[`"]/g, '');
    const target = likeMatch[2].trim();
    let pattern: string;
    if (target === '?') {
      pattern = String(boundValues[valueIndexRef.idx++]);
    } else {
      pattern = target.replace(/^['"]|['"]$/g, '');
    }
    const val = String(getColVal(row, col) ?? '');
    const regex = new RegExp('^' + pattern.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
    return regex.test(val);
  }

  // Handle operators =, !=, <>, >, <, >=, <=
  const opMatch = condition.match(/^(.*?)\s*(=|!=|<>|>=|<=|>|<)\s*(.*)$/);
  if (opMatch) {
    const col = opMatch[1].trim().replace(/[`"]/g, '');
    const op = opMatch[2];
    const right = opMatch[3].trim();
    let rightVal: any;

    if (right === '?') {
      rightVal = boundValues[valueIndexRef.idx++];
    } else if (right.startsWith("'") || right.startsWith('"')) {
      rightVal = right.slice(1, -1);
    } else if (!isNaN(Number(right))) {
      rightVal = Number(right);
    } else {
      rightVal = getColVal(row, right);
    }

    const leftVal = getColVal(row, col);
    if (op === '=') return leftVal == rightVal;
    if (op === '!=' || op === '<>') return leftVal != rightVal;
    if (op === '>') return leftVal > rightVal;
    if (op === '<') return leftVal < rightVal;
    if (op === '>=') return leftVal >= rightVal;
    if (op === '<=') return leftVal <= rightVal;
  }

  // Handle EXISTS or subqueries (return true as synthetic fallback)
  if (/EXISTS/i.test(condition)) {
    return true;
  }

  return true;
}

function getColVal(row: Record<string, any>, colExpr: string): any {
  const parts = colExpr.split('.');
  const colName = (parts[parts.length - 1] || colExpr).replace(/[`"]/g, '').trim();
  if (colName in row) return row[colName];
  // Check snake_case / camelCase variants
  const snake = colName.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  if (snake in row) return row[snake];
  return undefined;
}

function splitTopLevel(str: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let lastIndex = 0;
  const upper = str.toUpperCase();
  const sepUpper = separator.toUpperCase();

  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') depth--;
    else if (depth === 0 && upper.startsWith(sepUpper, i)) {
      parts.push(str.substring(lastIndex, i).trim());
      i += separator.length - 1;
      lastIndex = i + 1;
    }
  }
  parts.push(str.substring(lastIndex).trim());
  return parts.filter(p => p.length > 0);
}

class Statement implements D1PreparedStatement {
  private values: any[] = [];

  constructor(private sql: string) {}

  bind(...values: any[]): D1PreparedStatement {
    const s = new Statement(this.sql);
    s.values = [...values];
    return s;
  }

  private execute(): any[] {
    const rawSql = this.sql.trim().replace(/\r?\n/g, ' ');
    const bound = [...this.values];

    // Check INSERT
    const insertMatch = rawSql.match(/^INSERT(?:\s+OR\s+IGNORE)?\s+INTO\s+([a-zA-Z0-9_`"]+)\s*(?:\((.*?)\))?\s*VALUES\s*\((.*)\)/i);
    if (insertMatch) {
      const tableName = insertMatch[1].replace(/[`"]/g, '');
      const colsRaw = insertMatch[2];
      const valsRaw = insertMatch[3];
      const table = getTable(tableName);

      const colNames = colsRaw ? colsRaw.split(',').map(c => c.trim().replace(/[`"]/g, '')) : [];
      const valTokens = valsRaw.split(',').map(v => v.trim());

      let boundIdx = 0;
      const row: Record<string, any> = {};

      for (let i = 0; i < valTokens.length; i++) {
        const token = valTokens[i];
        let val: any;
        if (token === '?') {
          val = bound[boundIdx++];
        } else if (token.startsWith("'") || token.startsWith('"')) {
          val = token.slice(1, -1);
        } else if (!isNaN(Number(token))) {
          val = Number(token);
        } else {
          val = token;
        }

        const col = colNames[i] || `col_${i}`;
        row[col] = val;
      }

      // Check unique / primary key if INSERT OR IGNORE
      if (/IGNORE/i.test(rawSql)) {
        const existing = table.find(r => r.id && r.id === row.id);
        if (!existing) {
          table.push(row);
        }
      } else {
        table.push(row);
      }

      return [row];
    }

    // Check UPDATE
    const updateMatch = rawSql.match(/^UPDATE\s+([a-zA-Z0-9_`"]+)\s+SET\s+(.*?)(?:\s+WHERE\s+(.*))?$/i);
    if (updateMatch) {
      const tableName = updateMatch[1].replace(/[`"]/g, '');
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];
      const table = getTable(tableName);

      let boundIdx = 0;
      const setAssignments = setClause.split(',').map(s => s.trim());
      const updates: Array<{ col: string; valGetter: () => any }> = [];

      for (const assign of setAssignments) {
        const [colExpr, valExpr] = assign.split('=').map(x => x.trim());
        const col = colExpr.replace(/[`"]/g, '');
        if (valExpr === '?') {
          const val = bound[boundIdx++];
          updates.push({ col, valGetter: () => val });
        } else if (valExpr.includes('+')) {
          updates.push({ col, valGetter: () => (row: any) => (Number(row[col]) || 0) + 1 });
        } else if (valExpr.startsWith("'") || valExpr.startsWith('"')) {
          const val = valExpr.slice(1, -1);
          updates.push({ col, valGetter: () => val });
        } else if (!isNaN(Number(valExpr))) {
          const val = Number(valExpr);
          updates.push({ col, valGetter: () => val });
        } else {
          updates.push({ col, valGetter: () => valExpr });
        }
      }

      const valRef = { idx: boundIdx };
      let updatedCount = 0;

      for (const row of table) {
        const matches = !whereClause || evaluateCondition(row, whereClause, bound, { ...valRef });
        if (matches) {
          for (const u of updates) {
            const v = u.valGetter();
            if (typeof v === 'function') {
              row[u.col] = v(row);
            } else {
              row[u.col] = v;
            }
          }
          updatedCount++;
        }
      }

      return [{ changes: updatedCount }];
    }

    // Check DELETE
    const deleteMatch = rawSql.match(/^DELETE\s+FROM\s+([a-zA-Z0-9_`"]+)(?:\s+WHERE\s+(.*))?$/i);
    if (deleteMatch) {
      const tableName = deleteMatch[1].replace(/[`"]/g, '');
      const whereClause = deleteMatch[2];
      const table = getTable(tableName);

      if (!whereClause) {
        table.length = 0;
        return [{ changes: 1 }];
      }

      const valRef = { idx: 0 };
      const toKeep = table.filter(row => !evaluateCondition(row, whereClause, bound, { ...valRef }));
      const removed = table.length - toKeep.length;
      table.length = 0;
      table.push(...toKeep);

      return [{ changes: removed }];
    }

    // Check SELECT COUNT
    const countMatch = rawSql.match(/^SELECT\s+count\(\*\)\s+AS\s+([a-zA-Z0-9_]+)\s+FROM\s+([a-zA-Z0-9_`"]+)(?:\s+WHERE\s+(.*))?$/i);
    if (countMatch) {
      const alias = countMatch[1];
      const tableName = countMatch[2].replace(/[`"]/g, '');
      const whereClause = countMatch[3];
      const table = getTable(tableName);

      const valRef = { idx: 0 };
      const filtered = whereClause ? table.filter(row => evaluateCondition(row, whereClause, bound, { ...valRef })) : table;
      return [{ [alias]: filtered.length }];
    }

    // Check SELECT MAX
    const maxMatch = rawSql.match(/^SELECT\s+MAX\(([a-zA-Z0-9_]+)\)\s+AS\s+([a-zA-Z0-9_]+)\s+FROM\s+([a-zA-Z0-9_`"]+)(?:\s+WHERE\s+(.*))?$/i);
    if (maxMatch) {
      const col = maxMatch[1];
      const alias = maxMatch[2];
      const tableName = maxMatch[3].replace(/[`"]/g, '');
      const whereClause = maxMatch[4];
      const table = getTable(tableName);

      const valRef = { idx: 0 };
      const filtered = whereClause ? table.filter(row => evaluateCondition(row, whereClause, bound, { ...valRef })) : table;
      const maxVal = filtered.reduce((max, r) => Math.max(max, Number(r[col]) || 0), 0);
      return [{ [alias]: maxVal }];
    }

    // General SELECT
    const selectMatch = rawSql.match(/^SELECT\s+(.*?)\s+FROM\s+([a-zA-Z0-9_`"]+)(.*?)$/i);
    if (selectMatch) {
      const mainTable = selectMatch[2].replace(/[`"]/g, '');
      const rest = selectMatch[3];

      let rows = [...getTable(mainTable)];

      // Check if WHERE exists
      const whereMatch = rest.match(/\bWHERE\s+(.*?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
      if (whereMatch) {
        const whereClause = whereMatch[1];
        const valRef = { idx: 0 };
        rows = rows.filter(row => evaluateCondition(row, whereClause, bound, { ...valRef }));
      }

      // Check LIMIT
      const limitMatch = rest.match(/\bLIMIT\s+(\d+)/i);
      if (limitMatch) {
        rows = rows.slice(0, Number(limitMatch[1]));
      }

      return rows;
    }

    return [];
  }

  async first<T = unknown>(colName?: string): Promise<T | null> {
    const results = this.execute();
    if (results.length === 0) return null;
    const row = results[0];
    if (colName) {
      return (row[colName] ?? null) as T;
    }
    return row as T;
  }

  async all<T = unknown>(): Promise<{ results: T[]; success: boolean; meta: any }> {
    const results = this.execute() as T[];
    return { results, success: true, meta: { changes: 0 } };
  }

  async run(): Promise<{ success: boolean; meta: any }> {
    this.execute();
    return { success: true, meta: { changes: 1 } };
  }
}

class InMemoryD1Database implements D1Database {
  prepare(query: string): D1PreparedStatement {
    return new Statement(query);
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<any[]> {
    const results: any[] = [];
    for (const stmt of statements) {
      results.push(await stmt.run());
    }
    return results;
  }

  async exec(query: string): Promise<{ count: number; duration: number }> {
    const parts = query.split(';').map(p => p.trim()).filter(Boolean);
    for (const p of parts) {
      new Statement(p).run();
    }
    return { count: parts.length, duration: 1 };
  }
}

const singletonDb = new InMemoryD1Database();

export function getD1Database(): D1Database {
  return singletonDb;
}
