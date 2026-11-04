import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alarmas } from '../entities/entities/Alarmas.js';
import { Notificaciones } from '../entities/entities/Notificaciones.js';
import { AlarmasController } from './alarmas.controller.js';
import { AlarmasService } from './alarmas.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Alarmas, Notificaciones])],
  controllers: [AlarmasController],
  providers: [AlarmasService],
  exports: [AlarmasService],
})
export class AlarmasModule {}
