import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Accesos } from '../entities/entities/Accesos.js';
import { AccesosController } from './accesos.controller.js';
import { AccesosService } from './accesos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Accesos])],
  controllers: [AccesosController],
  providers: [AccesosService],
  exports: [AccesosService],
})
export class AccesosModule {}
