import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { Foundation, AccessError, hashToken, type Identity, type Actor } from './foundation';
import { base32, totp, equal, encrypt, decrypt } from './totp';
import { type D1Database } from './d1-database';

export class MFA {
  private auth: Foundation;
  constructor(private db: D1Database, private key: string, private origin: string, private now = () => Date.now()) {
    this.auth = new Foundation(db, now);
    if (!origin.startsWith('https://') && !origin.startsWith('http://localhost') && !origin.startsWith('http://127.0.0.1')) {
      // Relax for dev/preview
    }
  }

  private async limited(a: Actor) {
    await this.db.prepare('INSERT INTO mfa_attempts(id,user_id,at) VALUES(?,?,?)').bind(crypto.randomUUID(), a.user_id, this.now()).run();
    const n = await this.db.prepare('SELECT count(*) AS n FROM mfa_attempts WHERE user_id=? AND at>?').bind(a.user_id, this.now() - 300000).first<{ n: number }>();
    if ((n?.n ?? 0) > 10) throw new AccessError(429);
  }

  private async enrollAllowed(a: Actor) {
    const n = await this.db.prepare('SELECT count(*) AS n FROM mfa_factors WHERE user_id=? AND active=1').bind(a.user_id).first<{ n: number }>();
    if (n?.n && (!a.mfa_verified_at || a.mfa_verified_at > this.now() || this.now() - a.mfa_verified_at >= 900000)) throw new AccessError();
  }

  private assertions() {
    return [
      this.db.prepare('INSERT INTO transaction_assertions(value) VALUES(changes())'),
      this.db.prepare('DELETE FROM transaction_assertions'),
    ];
  }

  private stamp(a: Actor) {
    return [
      this.db.prepare('UPDATE sessions SET mfa_verified_at=? WHERE id=? AND user_id=? AND revoked_at IS NULL AND expires_at>?').bind(this.now(), a.session_id, a.user_id, this.now()),
      ...this.assertions(),
      this.auth.auditStatement(a, 'MFA_VERIFY', 'success', 'mfa'),
    ];
  }

  async beginTOTP(identity: Identity | null) {
    const a = await this.auth.actor(identity);
    await this.limited(a);
    await this.enrollAllowed(a);
    const secret = base32(crypto.getRandomValues(new Uint8Array(20)));
    const id = crypto.randomUUID();
    await this.db.prepare("INSERT INTO mfa_factors(id,user_id,kind,secret,created_at) VALUES(?,?,'totp',?,?)").bind(id, a.user_id, await encrypt(secret, this.key), this.now()).run();
    return { id, secret, uri: `otpauth://totp/CareBridge:${encodeURIComponent(a.user_id)}?secret=${secret}&issuer=CareBridge&algorithm=SHA1&digits=6&period=30` };
  }

  async verifyTOTP(identity: Identity | null, id: string, code: string) {
    const a = await this.auth.actor(identity);
    await this.limited(a);
    const f = await this.db.prepare("SELECT secret,last_step,active,created_at FROM mfa_factors WHERE id=? AND user_id=? AND kind='totp'").bind(id, a.user_id).first<{ secret: string; last_step: number; active: number; created_at: number }>();
    if (!f || (!f.active && this.now() - f.created_at > 300000)) throw new AccessError();
    if (!f.active) await this.enrollAllowed(a);

    const secret = await decrypt(f.secret, this.key);
    let accepted = -1;
    const step = Math.floor(this.now() / 30000);
    for (const v of [step - 1, step, step + 1]) {
      if (v > f.last_step && equal(await totp(secret, v), code)) accepted = v;
    }
    if (accepted < 0) {
      await this.auth.auditStatement(a, 'MFA_VERIFY', 'denied', 'totp').run();
      throw new AccessError();
    }
    await this.db.batch([
      this.db.prepare('UPDATE mfa_factors SET last_step=?,active=1 WHERE id=? AND user_id=? AND last_step<?').bind(accepted, id, a.user_id, accepted),
      ...this.assertions(),
      ...this.stamp(a),
    ]);
    return { verified: true };
  }

  async recoveryCodes(identity: Identity | null) {
    const a = await this.auth.actor(identity);
    if (!a.mfa_verified_at || a.mfa_verified_at > this.now() || this.now() - a.mfa_verified_at >= 900000) throw new AccessError();
    await this.limited(a);
    const codes = Array.from({ length: 8 }, () => crypto.randomUUID());
    const statements = [this.db.prepare('DELETE FROM mfa_recovery WHERE user_id=?').bind(a.user_id)];
    for (const code of codes) {
      statements.push(this.db.prepare('INSERT INTO mfa_recovery(id,user_id,hash) VALUES(?,?,?)').bind(crypto.randomUUID(), a.user_id, await hashToken(code)));
    }
    statements.push(this.auth.auditStatement(a, 'MFA_RECOVERY_GENERATE', 'success', 'mfa'));
    await this.db.batch(statements);
    return { codes };
  }

  async recover(identity: Identity | null, code: string) {
    const a = await this.auth.actor(identity);
    await this.limited(a);
    await this.db.batch([
      this.db.prepare('UPDATE mfa_recovery SET used_at=? WHERE user_id=? AND hash=? AND used_at IS NULL').bind(this.now(), a.user_id, await hashToken(code)),
      ...this.assertions(),
      ...this.stamp(a),
    ]);
    return { verified: true };
  }

  async options(identity: Identity | null, kind: 'register' | 'authenticate') {
    const a = await this.auth.actor(identity);
    await this.limited(a);
    if (kind === 'register') await this.enrollAllowed(a);
    const factors = await this.db.prepare("SELECT id FROM mfa_factors WHERE user_id=? AND kind='webauthn' AND active=1").bind(a.user_id).all<{ id: string }>();
    const rpID = this.origin.includes('://') ? new URL(this.origin).hostname : 'localhost';
    const options = kind === 'register'
      ? await generateRegistrationOptions({
          rpName: 'CareBridge Canada',
          rpID,
          userID: new TextEncoder().encode(a.user_id),
          userName: a.user_id,
          attestationType: 'none',
          excludeCredentials: factors.results.map(f => ({ id: f.id })),
          authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
        })
      : await generateAuthenticationOptions({
          rpID,
          allowCredentials: factors.results.map(f => ({ id: f.id })),
          userVerification: 'required',
        });
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO mfa_challenges(id,user_id,session_id,kind,challenge,expires_at) VALUES(?,?,?,?,?,?)').bind(id, a.user_id, a.session_id, kind, options.challenge, this.now() + 300000).run();
    return { id, options };
  }

  async webauthn(identity: Identity | null, id: string, response: RegistrationResponseJSON | AuthenticationResponseJSON) {
    const a = await this.auth.actor(identity);
    await this.limited(a);
    const challenge = await this.db.prepare('SELECT * FROM mfa_challenges WHERE id=? AND user_id=? AND session_id=? AND used_at IS NULL AND expires_at>?').bind(id, a.user_id, a.session_id, this.now()).first<{ kind: string; challenge: string }>();
    if (!challenge) throw new AccessError();
    await this.db.batch([
      this.db.prepare('UPDATE mfa_challenges SET used_at=? WHERE id=? AND used_at IS NULL').bind(this.now(), id),
      ...this.assertions(),
    ]);
    const rpID = this.origin.includes('://') ? new URL(this.origin).hostname : 'localhost';
    if (challenge.kind === 'register') {
      await this.enrollAllowed(a);
      const result = await verifyRegistrationResponse({
        response: response as RegistrationResponseJSON,
        expectedChallenge: challenge.challenge,
        expectedOrigin: this.origin,
        expectedRPID: rpID,
        requireUserVerification: true,
      });
      if (!result.verified || !result.registrationInfo) throw new AccessError();
      const c = result.registrationInfo.credential;
      await this.db.batch([
        this.db.prepare("INSERT INTO mfa_factors(id,user_id,kind,public_key,counter,active,created_at) VALUES(?,?,'webauthn',?,?,1,?)").bind(c.id, a.user_id, JSON.stringify(Array.from(c.publicKey)), c.counter, this.now()),
        ...this.stamp(a),
      ]);
    } else {
      const f = await this.db.prepare("SELECT public_key,counter FROM mfa_factors WHERE id=? AND user_id=? AND kind='webauthn' AND active=1").bind(response.id, a.user_id).first<{ public_key: string; counter: number }>();
      if (!f) throw new AccessError();
      const result = await verifyAuthenticationResponse({
        response: response as AuthenticationResponseJSON,
        expectedChallenge: challenge.challenge,
        expectedOrigin: this.origin,
        expectedRPID: rpID,
        requireUserVerification: true,
        credential: { id: response.id, publicKey: new Uint8Array(JSON.parse(f.public_key)), counter: f.counter },
      });
      if (!result.verified) throw new AccessError();
      await this.db.batch([
        this.db.prepare('UPDATE mfa_factors SET counter=? WHERE id=? AND user_id=? AND counter=?').bind(result.authenticationInfo.newCounter, response.id, a.user_id, f.counter),
        ...this.assertions(),
        ...this.stamp(a),
      ]);
    }
    return { verified: true };
  }

  async factors(identity: Identity | null) {
    const a = await this.auth.actor(identity);
    return (await this.db.prepare('SELECT id,kind,active FROM mfa_factors WHERE user_id=?').bind(a.user_id).all()).results;
  }
}
