import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventosController } from './eventos.controller.js';
import { EventosService } from './eventos.service.js';
import { NotificacionesPushModule } from '../notificaciones-push/notificaciones-push.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([]), NotificacionesPushModule],
  controllers: [EventosController],
  providers: [EventosService],
  exports: [EventosService],
})
export class EventosModule {}
