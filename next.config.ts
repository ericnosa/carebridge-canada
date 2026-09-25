import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
 async headers(){return [{source:'/:path*',headers:[
 {key:'Strict-Transport-Security',value:'max-age=31536000'},
 {key:'X-Content-Type-Options',value:'nosniff'},
 {key:'Referrer-Policy',value:'no-referrer'},
 {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
 {key:'X-Frame-Options',value:'DENY'},
 {key:'Content-Security-Policy',value:"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'"}
 ]}]}
};
export default nextConfig;
