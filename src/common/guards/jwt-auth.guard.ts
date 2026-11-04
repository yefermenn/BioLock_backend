import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import jwt from 'jsonwebtoken';
import { IS_PUBLIC_KEY } from '../public.decorator.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization as string | undefined;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        error: 'no_autenticado',
        mensaje: 'Falta el token de acceso.',
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const secret = String(process.env.JWT_SECRET ?? 'dev-secret-key-for-local-32chars');

    try {
      const payload = jwt.verify(token, secret) as unknown as {
        sub: number;
        roles?: string[];
        permisos?: string[];
      };

      const roles = Array.isArray(payload.roles) && payload.roles.length > 0
        ? payload.roles
        : await this.dataSource.query(
            `SELECT DISTINCT r.nombre
             FROM public.usuarios_roles ur
             JOIN public.roles r ON r.id = ur.rol_id
             WHERE ur.usuario_id = $1 AND r.activo = true`,
            [payload.sub],
          );

      const permisos = Array.isArray(payload.permisos) && payload.permisos.length > 0
        ? payload.permisos
        : await this.dataSource.query(
            `SELECT DISTINCT p.codigo
             FROM public.usuarios_roles ur
             JOIN public.roles r ON r.id = ur.rol_id
             JOIN public.roles_permisos rp ON rp.rol_id = r.id
             JOIN public.permisos p ON p.id = rp.permiso_id
             WHERE ur.usuario_id = $1 AND r.activo = true`,
            [payload.sub],
          );

      request.user = {
        id: payload.sub,
        roles: (roles as Array<{ nombre: string }>).map((rol) => rol.nombre ?? rol),
        permisos: (permisos as Array<{ codigo: string }>).map((permiso) => permiso.codigo ?? permiso),
      };

      return true;
    } catch {
      throw new UnauthorizedException({
        error: 'no_autenticado',
        mensaje: 'El token de acceso es inválido o expiró.',
      });
    }
  }
}
