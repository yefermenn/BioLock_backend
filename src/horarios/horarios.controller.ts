import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { HorariosService } from './horarios.service.js';

@Controller('zonas')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Get()
  @Permisos('ver_horarios')
  listAll(@Query('zona_id') zonaId?: string) {
    if (!zonaId) {
      return { items: [] };
    }

    return this.horariosService.list(Number(zonaId));
  }

  @Get(':zonaId/horarios')
  @Permisos('ver_horarios')
  list(@Param('zonaId', ParseIntPipe) zonaId: number) {
    return this.horariosService.list(zonaId);
  }

  @Post(':zonaId/horarios')
  @Permisos('gestionar_horarios')
  create(
    @Param('zonaId', ParseIntPipe) zonaId: number,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.horariosService.create(zonaId, dto);
  }

  @Put(':zonaId/horarios')
  @Permisos('gestionar_horarios')
  replace(
    @Param('zonaId', ParseIntPipe) zonaId: number,
    @Body() dto: { horarios: Record<string, unknown>[] },
  ) {
    return { ok: true, zona_id: zonaId, horarios: dto.horarios };
  }

  @Patch('horarios/:id')
  @Permisos('gestionar_horarios')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Record<string, unknown>) {
    return this.horariosService.update(id, dto);
  }

  @Delete('horarios/:id')
  @Permisos('gestionar_horarios')
  remove(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, eliminado: id };
  }
}

@Controller('horarios')
export class HorariosCatalogController {
  constructor(private readonly horariosService: HorariosService) {}

  @Get()
  @Permisos('ver_horarios')
  list(@Query('zona_id') zonaId?: string) {
    if (!zonaId) {
      return { items: [] };
    }

    return this.horariosService.list(Number(zonaId));
  }
}
