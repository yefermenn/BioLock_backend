import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DispositivoTokenGuard } from '../common/guards/dispositivo-token.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Publico } from '../common/public.decorator.js';
import { Roles } from '../common/roles.decorator.js';
import { UsuarioActual } from '../common/user.decorator.js';
import { ResultadoOrdenDto } from './dto/resultado-orden.dto.js';
import { OrdenesService } from './ordenes.service.js';
import { DispositivoActual } from '../common/dispositivo.decorator.js';
import { Dispositivos } from '../entities/entities/Dispositivos.js';

@Controller()
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post('dispositivos/:id/apertura-remota')
  @UseGuards(RolesGuard)
  @Roles('administrador', 'superadmin')
  crearAperturaRemota(
    @Param('id', ParseIntPipe) dispositivoId: number,
    @UsuarioActual() usuario: { id: number },
  ) {
    return this.ordenesService.crearAperturaRemota(dispositivoId, usuario.id);
  }

  @Get('ordenes/:id')
  consultarOrden(@Param('id', ParseIntPipe) ordenId: number) {
    return this.ordenesService.consultarOrden(ordenId);
  }

  @Publico()
  @UseGuards(DispositivoTokenGuard)
  @Get('dispositivos/ordenes/pendientes')
  obtenerPendientes(@DispositivoActual() dispositivo: Dispositivos) {
    return this.ordenesService.obtenerPendientesDispositivo(dispositivo);
  }

  @Publico()
  @UseGuards(DispositivoTokenGuard)
  @Post('dispositivos/ordenes/:id/resultado')
  reportarResultado(
    @Param('id', ParseIntPipe) ordenId: number,
    @Body() dto: ResultadoOrdenDto,
    @DispositivoActual() dispositivo: Dispositivos,
  ) {
    return this.ordenesService.reportarResultado(ordenId, dto, dispositivo);
  }
}
