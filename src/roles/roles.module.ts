import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from '../entities/entities/Roles.js';
import { RolesPermisos } from '../entities/entities/RolesPermisos.js';
import { Permisos } from '../entities/entities/Permisos.js';
import { RolesController } from './roles.controller.js';
import { RolesService } from './roles.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Roles, RolesPermisos, Permisos])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
