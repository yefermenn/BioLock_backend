export type PermisoRequerido = string | string[];

export interface UsuarioAutenticado {
  id: number;
  nombre?: string;
  correo?: string;
  roles: string[];
  permisos: string[];
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  usuario: {
    id: number;
    nombre: string;
    correo: string;
    roles: string[];
    permisos: string[];
  };
}
