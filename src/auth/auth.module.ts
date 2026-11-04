import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { Sesiones } from '../entities/entities/Sesiones.js';
import { Usuarios } from '../entities/entities/Usuarios.js';
import { UsuariosRoles } from '../entities/entities/UsuariosRoles.js';
import { RolesPermisos } from '../entities/entities/RolesPermisos.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuarios, Sesiones, UsuariosRoles, RolesPermisos]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
