export type SystemUserRole = 'ROOT' | 'ADMIN' | 'CLIENT';

export type SystemUserRoleFilter = SystemUserRole | 'ALL';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: SystemUserRole;
  isBlocked: boolean;
}

export interface SystemUserFilters {
  name: string;
  email: string;
  role: SystemUserRoleFilter;
}

export interface CreateSystemUserRequest {
  name: string;
  email: string;
  password: string;
  role: SystemUserRole;
}

export interface UpdateSystemUserRequest {
  name: string;
  email: string;
  role: SystemUserRole;
}
