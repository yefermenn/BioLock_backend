import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispositivos } from '../entities/entities/Dispositivos.js';
import { Configuracion } from '../entities/entities/Configuracion.js';
import { DispositivosZonas } from '../entities/entities/DispositivosZonas.js';
import { DispositivosController } from './dispositivos.controller.js';
import { DispositivosService } from './dispositivos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Dispositivos, Configuracion, DispositivosZonas])],
  controllers: [DispositivosController],
  providers: [DispositivosService],
  exports: [DispositivosService],
})
export class DispositivosModule {}
