import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Permisos('ver_usuarios')
  list(@Query('pagina') pagina = '1') {
    return this.usuariosService.list();
  }

  @Get(':id')
  @Permisos('ver_usuarios')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findById(id);
  }

  @Post()
  @Permisos('gestionar_usuarios')
  create(@Body() dto: Record<string, unknown>) {
    return this.usuariosService.create(dto);
  }

  @Patch(':id')
  @Permisos('gestionar_usuarios')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.usuariosService.update(id, dto);
  }

  @Patch(':id/estado')
  @Permisos('gestionar_usuarios')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { activo: boolean },
  ) {
    return this.usuariosService.cambiarEstado(id, body.activo);
  }

  @Delete(':id/roles/:rolId')
  @Permisos('gestionar_roles')
  quitarRol(@Param('id', ParseIntPipe) id: number, @Param('rolId', ParseIntPipe) rolId: number) {
    return { ok: true, idUsuario: id, idRol: rolId };
  }
}
