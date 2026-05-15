import { jwtDecode } from 'jwt-decode';

export type UserRole = 'ROOT' | 'ADMIN' | 'CLIENT' | string;

export interface SessionUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  companyId?: string;
  phone?: string;
}

interface JwtPayload {
  exp?: number;
  sub: string;
  userId?: string;
  roles?: string[];
  name?: string;
  companyId?: string;
  phone?: string;
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function decodeSessionUser(token: string): SessionUser {
  const decoded = jwtDecode<JwtPayload>(token);
  const rawRole = decoded.roles && decoded.roles.length > 0 ? decoded.roles[0] : '';
  const id = typeof decoded.userId === 'string' ? decoded.userId : '';
  if (!id) {
    throw new Error('Token inválido: userId ausente');
  }
  return {
    id,
    role: rawRole as UserRole,
    name: typeof decoded.name === 'string' && decoded.name.length > 0 ? decoded.name : decoded.sub,
    email: decoded.sub,
    companyId: typeof decoded.companyId === 'string' ? decoded.companyId : undefined,
    phone: typeof decoded.phone === 'string' ? decoded.phone : undefined,
  };
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'ROOT';
}
