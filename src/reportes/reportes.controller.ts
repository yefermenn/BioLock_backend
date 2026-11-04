import { Controller, Get, Param, Query } from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { ReportesService } from './reportes.service.js';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  @Permisos('ver_reportes')
  catalogo() {
    return this.reportesService.catalogo();
  }

  @Get(':clave')
  @Permisos('ver_reportes')
  ejecutar(@Param('clave') clave: string, @Query() filters: Record<string, unknown>) {
    return this.reportesService.ejecutar(clave);
  }
}
