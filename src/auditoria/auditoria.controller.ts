import { Controller, Get, Query } from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { AuditoriaService } from './auditoria.service.js';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @Permisos('ver_auditoria')
  async list(
    @Query('usuario_id') usuarioId?: string,
    @Query('accion') accion?: string,
    @Query('tabla') tabla?: string,
  ) {
    const { items, total } = await this.auditoriaService.list({
      usuarioId: usuarioId ? Number(usuarioId) : undefined,
      accion,
      tabla,
    });

    return {
      items,
      total,
      pagina: 1,
      limite: 20,
    };
  }
}
