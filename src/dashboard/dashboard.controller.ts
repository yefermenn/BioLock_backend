import { Controller, Get, Query } from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { DashboardService } from './dashboard.service.js';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumen')
  @Permisos('ver_dashboard')
  resumen() {
    return this.dashboardService.resumen();
  }

  @Get('tendencia')
  @Permisos('ver_dashboard')
  tendencia(@Query('dias') dias = '7') {
    return this.dashboardService.tendencia(Number(dias));
  }
}
