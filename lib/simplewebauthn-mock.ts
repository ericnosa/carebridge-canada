export type RegistrationResponseJSON = {
  id: string;
  rawId?: string;
  response?: {
    clientDataJSON?: string;
    attestationObject?: string;
  };
  type?: 'public-key';
  clientExtensionResults?: Record<string, any>;
};

export type AuthenticationResponseJSON = {
  id: string;
  rawId?: string;
  response?: {
    clientDataJSON?: string;
    authenticatorData?: string;
    signature?: string;
    userHandle?: string;
  };
  type?: 'public-key';
  clientExtensionResults?: Record<string, any>;
};

export async function generateRegistrationOptions(opts: any) {
  return {
    challenge: Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url'),
    rp: { name: opts.rpName, id: opts.rpID },
    user: { id: 'demo-user', name: opts.userName, displayName: opts.userName },
    pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
    timeout: 60000,
    attestation: 'none',
    excludeCredentials: opts.excludeCredentials || [],
    authenticatorSelection: opts.authenticatorSelection || {},
  };
}

export async function generateAuthenticationOptions(opts: any) {
  return {
    challenge: Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url'),
    timeout: 60000,
    rpId: opts.rpID,
    allowCredentials: opts.allowCredentials || [],
    userVerification: opts.userVerification || 'preferred',
  };
}

export async function verifyRegistrationResponse(opts: any) {
  const credId = opts.response?.id || crypto.randomUUID();
  return {
    verified: true,
    registrationInfo: {
      credential: {
        id: credId,
        publicKey: new Uint8Array([1, 2, 3, 4]),
        counter: 0,
      },
    },
  };
}

export async function verifyAuthenticationResponse(opts: any) {
  return {
    verified: true,
    authenticationInfo: {
      newCounter: (opts.credential?.counter ?? 0) + 1,
    },
  };
}
