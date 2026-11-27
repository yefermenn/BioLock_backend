import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuarios } from '../entities/entities/Usuarios.js';
import { UsuariosRoles } from '../entities/entities/UsuariosRoles.js';
import { PushTokens } from '../entities/entities/PushTokens.js';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';
import { AuditoriaModule } from '../auditoria/auditoria.module.js';
import { MeController } from './me.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Usuarios, UsuariosRoles, PushTokens]), AuditoriaModule],
  controllers: [UsuariosController, MeController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
