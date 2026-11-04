import { Controller, Get } from '@nestjs/common';
import { Permisos } from '../common/permissions.decorator.js';
import { IntentosFallidosService } from './intentos-fallidos.service.js';

@Controller('intentos-fallidos')
export class IntentosFallidosController {
  constructor(private readonly service: IntentosFallidosService) {}

  @Get()
  @Permisos('ver_intentos_fallidos')
  list() {
    return this.service.list();
  }
}
