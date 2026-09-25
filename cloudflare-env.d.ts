declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    MFA_ENCRYPTION_KEY?: string;
    CAREBRIDGE_ORIGIN?: string;
    SYNTHETIC_DEMO_ENABLED?: string;
    BUCKET?: R2Bucket;
  }
}
