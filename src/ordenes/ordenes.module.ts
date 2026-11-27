import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaModule } from '../auditoria/auditoria.module.js';
import { DispositivoTokenGuard } from '../common/guards/dispositivo-token.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Dispositivos } from '../entities/entities/Dispositivos.js';
import { OrdenApertura } from '../entities/entities/OrdenApertura.js';
import { Usuarios } from '../entities/entities/Usuarios.js';
import { OrdenesController } from './ordenes.controller.js';
import { OrdenesService } from './ordenes.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdenApertura, Dispositivos, Usuarios]),
    AuditoriaModule,
  ],
  controllers: [OrdenesController],
  providers: [OrdenesService, DispositivoTokenGuard, RolesGuard],
  exports: [OrdenesService, DispositivoTokenGuard, RolesGuard],
})
export class OrdenesModule {}
