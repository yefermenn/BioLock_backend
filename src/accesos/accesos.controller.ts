import { Controller, Get, Query } from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { AccesosService } from './accesos.service.js';

@Controller('accesos')
export class AccesosController {
  constructor(private readonly accesosService: AccesosService) {}

  @Get()
  @Permisos('ver_accesos')
  list(
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('usuario_id') usuarioId?: string,
    @Query('zona_id') zonaId?: string,
    @Query('dispositivo_id') dispositivoId?: string,
    @Query('tipo_acceso') tipoAcceso?: string,
  ) {
    return this.accesosService.list({
      pagina: pagina ? Number(pagina) : 1,
      limite: limite ? Number(limite) : 20,
      desde,
      hasta,
      usuario_id: usuarioId ? Number(usuarioId) : undefined,
      zona_id: zonaId ? Number(zonaId) : undefined,
      dispositivo_id: dispositivoId ? Number(dispositivoId) : undefined,
      tipo_acceso: tipoAcceso,
    });
  }
}
