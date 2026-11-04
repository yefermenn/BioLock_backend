import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISOS_KEY } from '../permissions.decorator.js';

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISOS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user ?? { roles: [], permisos: [] };

    if (user.roles?.includes('superadmin')) {
      return true;
    }

    const permisosUsuario = new Set(user.permisos ?? []);
    const tieneTodos = requiredPermissions.every((permiso) =>
      permisosUsuario.has(permiso),
    );

    if (!tieneTodos) {
      throw new ForbiddenException({
        error: 'sin_permiso',
        mensaje: 'No tienes permisos suficientes para ejecutar esta acción.',
      });
    }

    return true;
  }
}
