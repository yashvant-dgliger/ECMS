import { RoleCode } from '../enums/roles';

export interface LoginRequest {
  firebaseIdToken: string;
  deviceId: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roles: RoleCode[];
}
