/** 1 = activo, 0 = baja lógica (nunca hard delete). */
export const Estatus = {
  Baja: 0,
  Activo: 1,
} as const;

export type EstatusValue = (typeof Estatus)[keyof typeof Estatus];
