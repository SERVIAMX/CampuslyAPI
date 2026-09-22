export interface JwtAccessPayload {
  sub: string;
  userName: string;
  roleId: string | null;
  email: string | null;
  type: 'access';
}

export interface JwtRefreshPayload {
  sub: string;
  type: 'refresh';
}
