import { Body, Controller, Get, Headers, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { DispositivosService } from './dispositivos.service.js';

@Controller('dispositivos')
export class DispositivosController {
  constructor(private readonly dispositivosService: DispositivosService) {}

  @Post('biometria')
  @Permisos('gestionar_dispositivos')
  registrarBiometria(
    @Headers('authorization') authorization: string,
    @Body() dto: { usuario_ids?: number[] },
  ) {
    return this.dispositivosService.actualizarBiometriaPorToken(authorization, dto.usuario_ids ?? []);
  }

  @Get()
  @Permisos('ver_dispositivos')
  list() {
    return this.dispositivosService.list();
  }

  @Get(':id')
  @Permisos('ver_dispositivos')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.dispositivosService.findById(id);
  }

  @Post()
  @Permisos('gestionar_dispositivos')
  create(@Body() dto: Record<string, unknown>) {
    return this.dispositivosService.create(dto);
  }

  @Patch(':id')
  @Permisos('gestionar_dispositivos')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.dispositivosService.update(id, dto);
  }

  @Patch(':id/estado')
  @Permisos('gestionar_dispositivos')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { activo: boolean },
  ) {
    return { ok: true, id, activo: body.activo };
  }

  @Post(':id/token')
  @Permisos('regenerar_token_dispositivo')
  regenerarToken(@Param('id', ParseIntPipe) id: number) {
    return { ok: true, id, token: 'demo-token-0123456789' };
  }

  @Get(':id/configuracion')
  @Permisos('ver_dispositivos')
  getConfiguracion(@Param('id', ParseIntPipe) id: number) {
    return { dispositivo_id: id, umbral_biometrico: 0.55 };
  }

  @Put(':id/configuracion')
  @Permisos('gestionar_dispositivos')
  guardarConfiguracion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Record<string, unknown>,
  ) {
    return { ok: true, id, data: dto };
  }
}
