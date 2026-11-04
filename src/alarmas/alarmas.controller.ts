import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { AlarmasService } from './alarmas.service.js';

@Controller('alarmas')
export class AlarmasController {
  constructor(private readonly service: AlarmasService) {}

  @Get()
  @Permisos('ver_alarmas')
  list() {
    return this.service.list();
  }

  @Get(':id')
  @Permisos('ver_alarmas')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Patch(':id/resolver')
  @Permisos('resolver_alarmas')
  resolver(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { estado: 'resuelta' | 'falsa_alarma'; observaciones: string },
  ) {
    return this.service.resolver(id, dto);
  }

  @Get('activas/conteo')
  @Permisos('ver_alarmas')
  conteo() {
    return { activas: 1 };
  }
}
