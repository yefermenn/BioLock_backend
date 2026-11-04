import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { ZonasService } from './zonas.service.js';

@Controller('zonas')
export class ZonasController {
  constructor(private readonly zonasService: ZonasService) {}

  @Get()
  @Permisos('ver_zonas')
  list() {
    return this.zonasService.list();
  }

  @Get(':id')
  @Permisos('ver_zonas')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.zonasService.findById(id);
  }

  @Post()
  @Permisos('gestionar_zonas')
  create(@Body() dto: Record<string, unknown>) {
    return this.zonasService.create(dto);
  }

  @Patch(':id')
  @Permisos('gestionar_zonas')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.zonasService.update(id, dto);
  }

  @Patch(':id/estado')
  @Permisos('gestionar_zonas')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { activa: boolean },
  ) {
    return { ok: true, id, activa: body.activa };
  }
}
