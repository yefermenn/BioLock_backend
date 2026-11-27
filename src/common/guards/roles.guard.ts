import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const roles: string[] = request.user?.roles ?? [];

    if (roles.includes('superadmin') || requiredRoles.some((role) => roles.includes(role))) {
      return true;
    }

    throw new ForbiddenException({
      error: 'sin_permiso',
      mensaje: 'Solo los administradores pueden ejecutar esta acción.',
    });
  }
}
