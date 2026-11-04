import { SetMetadata } from '@nestjs/common';

export const PERMISOS_KEY = 'requiredPermisos';
export const Permisos = (...permisos: string[]) =>
  SetMetadata(PERMISOS_KEY, permisos);
