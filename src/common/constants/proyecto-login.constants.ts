/** Ids fijos de CatProyectos para los portales de login. */
export const ProyectoLogin = {
  GestionWeb: 1,
  Docentes: 2,
  Tutores: 3,
} as const;

export type ProyectoLoginId =
  (typeof ProyectoLogin)[keyof typeof ProyectoLogin];

export const PROYECTO_LOGIN_NOMBRES: Record<ProyectoLoginId, string> = {
  [ProyectoLogin.GestionWeb]: 'GestionWeb',
  [ProyectoLogin.Docentes]: 'Docentes',
  [ProyectoLogin.Tutores]: 'Tutores',
};
