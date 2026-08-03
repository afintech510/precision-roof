// Cloudflare Access identity gate for /api/operator/* (spec §7.1). Access sits
// in front of these routes and injects the verified operator's email; its
// absence means the request never passed Access, so the route must 403 rather
// than trust anything else in the request.

export interface OperatorIdentity {
  operatorId: string;
}

export function requireOperatorAccess(request: Request): OperatorIdentity | null {
  const email = request.headers.get('Cf-Access-Authenticated-User-Email');
  if (!email) return null;
  return { operatorId: email };
}
