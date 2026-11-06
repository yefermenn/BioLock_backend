import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { UsuarioActual } from '../common/user.decorator.js';
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

  @Post(':id/roles')
  @Permisos('gestionar_roles')
  asignarRol(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { rol_id?: number },
    @UsuarioActual() user: any,
  ) {
    return this.usuariosService.asignarRol(id, Number(dto.rol_id), user?.id ?? null);
  }

  @Delete(':id/roles/:rol_id')
  @Permisos('gestionar_roles')
  quitarRol(
    @Param('id', ParseIntPipe) id: number,
    @Param('rol_id', ParseIntPipe) rolId: number,
    @UsuarioActual() user: any,
  ) {
    return this.usuariosService.quitarRol(id, rolId, user?.id ?? null);
  }

  @Patch(':id/password')
  @Permisos('gestionar_usuarios')
  restablecerPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { password?: string },
    @UsuarioActual() user: any,
  ) {
    if (!user?.roles?.includes('superadmin')) {
      throw new ForbiddenException({
        error: 'sin_permiso',
        mensaje: 'Solo el superadmin puede restablecer la contraseña de otro usuario.',
      });
    }

    return this.usuariosService.restablecerPassword(id, String(dto.password ?? ''));
  }
}
