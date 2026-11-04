import { Controller, Get, Query } from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { AccesosService } from './accesos.service.js';

@Controller('accesos')
export class AccesosController {
  constructor(private readonly accesosService: AccesosService) {}

  @Get()
  @Permisos('ver_accesos')
  list(@Query('pagina') pagina?: string) {
    return this.accesosService.list();
  }
}
