import ts from 'typescript';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const root=path.resolve('.sites-runtime/test-modules');mkdirSync(root,{recursive:true});
export async function service(name){for(const f of ['foundation','totp','mfa','scheduling','demo']){const source=readFileSync('lib/'+f+'.ts','utf8');const js=ts.transpile(source,{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}).replace(/from '(\.\/[^']+)'/g,"from '$1.mjs'");writeFileSync(root+'/'+f+'.mjs',js);}return import(pathToFileURL(root+'/'+name+'.mjs').href);}
