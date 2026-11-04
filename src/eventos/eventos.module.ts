import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventosController } from './eventos.controller.js';
import { EventosService } from './eventos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [EventosController],
  providers: [EventosService],
  exports: [EventosService],
})
export class EventosModule {}
