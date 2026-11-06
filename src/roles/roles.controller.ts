import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { RolesService } from './roles.service.js';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permisos')
  @Permisos('ver_roles')
  listPermisos() {
    return this.rolesService.listPermisos();
  }

  @Get()
  @Permisos('ver_roles')
  list() {
    return this.rolesService.list();
  }

  @Get(':id')
  @Permisos('ver_roles')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findById(id);
  }

  @Post()
  @Permisos('gestionar_roles')
  create(@Body() dto: Record<string, unknown>) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @Permisos('gestionar_roles')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Record<string, unknown>,
  ) {
    return this.rolesService.update(id, dto);
  }

  @Put(':id/permisos')
  @Permisos('gestionar_roles')
  reemplazarPermisos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { permisos: number[] },
  ) {
    return this.rolesService.reemplazarPermisos(id, dto.permisos ?? []);
  }
}

@Controller('permisos')
export class PermisosController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permisos('ver_roles')
  list() {
    return this.rolesService.listPermisos();
  }
}
