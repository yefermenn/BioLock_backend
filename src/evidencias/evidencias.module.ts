import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvidenciasIntrusos } from '../entities/entities/EvidenciasIntrusos.js';
import { Dispositivos } from '../entities/entities/Dispositivos.js';
import { DispositivoTokenGuard } from '../common/guards/dispositivo-token.guard.js';
import { EvidenciasController } from './evidencias.controller.js';
import { EvidenciasService } from './evidencias.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([EvidenciasIntrusos, Dispositivos])],
  controllers: [EvidenciasController],
  providers: [EvidenciasService, DispositivoTokenGuard],
  exports: [EvidenciasService],
})
export class EvidenciasModule {}
