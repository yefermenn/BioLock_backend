import { Module } from '@nestjs/common';
import { NotificacionesPushService } from './notificaciones-push.service.js';

@Module({ providers: [NotificacionesPushService], exports: [NotificacionesPushService] })
export class NotificacionesPushModule {}
