import { Controller, Get, Query } from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { AuditoriaService } from './auditoria.service.js';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @Permisos('ver_auditoria')
  list(
    @Query('usuario_id') usuarioId?: string,
    @Query('accion') accion?: string,
    @Query('tabla') tabla?: string,
  ) {
    return {
      items: [{
        id: 1,
        fecha: new Date().toISOString(),
        usuario: { id: 1, nombre: 'Kevin Delgado' },
        accion: accion ?? 'LOGIN',
        tabla_afectada: tabla ?? 'sesiones',
        registro_id: 1,
        ip_origen: '127.0.0.1',
        detalle: { ok: true },
      }],
      total: 1,
      pagina: 1,
      limite: 20,
    };
  }
}
