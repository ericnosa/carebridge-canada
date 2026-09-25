export async function startRegistration({ optionsJSON }: { optionsJSON: any }) {
  return {
    id: 'demo-passkey-' + Math.random().toString(36).substring(2, 9),
    rawId: 'demo-raw-id',
    response: {
      clientDataJSON: typeof btoa !== 'undefined'
        ? btoa(JSON.stringify({ type: 'webauthn.create', challenge: optionsJSON.challenge, origin: window.location.origin }))
        : '',
      attestationObject: 'demo-attestation',
    },
    type: 'public-key',
    clientExtensionResults: {},
  };
}

export async function startAuthentication({ optionsJSON }: { optionsJSON: any }) {
  return {
    id: optionsJSON.allowCredentials?.[0]?.id || 'demo-passkey',
    rawId: 'demo-raw-id',
    response: {
      clientDataJSON: typeof btoa !== 'undefined'
        ? btoa(JSON.stringify({ type: 'webauthn.get', challenge: optionsJSON.challenge, origin: window.location.origin }))
        : '',
      authenticatorData: 'demo-auth-data',
      signature: 'demo-signature',
      userHandle: 'demo-user',
    },
    type: 'public-key',
    clientExtensionResults: {},
  };
}
