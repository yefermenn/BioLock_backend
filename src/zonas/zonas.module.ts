import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zonas } from '../entities/entities/Zonas.js';
import { ZonasController } from './zonas.controller.js';
import { ZonasService } from './zonas.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Zonas])],
  controllers: [ZonasController],
  providers: [ZonasService],
  exports: [ZonasService],
})
export class ZonasModule {}
