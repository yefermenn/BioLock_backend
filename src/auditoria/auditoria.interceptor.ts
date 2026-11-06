import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditoriaService } from './auditoria.service.js';

const CAMPOS_SENSIBLES = new Set([
  'password',
  'password_hash',
  'passwordactual',
  'password_actual',
  'password_nueva',
  'token',
  'refresh_token',
  'access_token',
  'token_hash',
  'authorization',
  'secret',
]);

function esCampoSensitivo(key: string): boolean {
  const nombre = key.toLowerCase();

  if (CAMPOS_SENSIBLES.has(nombre)) {
    return true;
  }

  return (
    nombre.includes('password') ||
    nombre.includes('token') ||
    nombre.includes('secret') ||
    nombre.includes('authorization') ||
    nombre.includes('clave') ||
    nombre.includes('jwt')
  );
}

function sanitizarValor(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizarValor(item));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (acc, [key, itemValue]) => {
        if (esCampoSensitivo(key)) {
          acc[key] = '[filtrado]';
          return acc;
        }

        acc[key] = sanitizarValor(itemValue);
        return acc;
      },
      {},
    );
  }

  return value;
}

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method?.toUpperCase() ?? 'GET';
    const route = request.route?.path ?? request.originalUrl ?? 'unknown';

    return next.handle().pipe(
      tap(async () => {
        if (method === 'GET' || method === 'OPTIONS') {
          return;
        }

        const usuario = request.user ?? null;
        const body = request.body ?? {};
        const detalle = sanitizarValor({
          ruta: route,
          metodo: method,
          body: body && typeof body === 'object' ? body : { valor: body },
        });

        await this.auditoriaService.registrar({
          usuarioId: usuario?.id ?? null,
          accion: method,
          tablaAfectada: route.replace(/^\//, ''),
          registroId: body?.id ?? body?.usuario_id ?? request.params?.id ?? null,
          ip: request.ip,
          detalle,
        });
      }),
    );
  }
}
