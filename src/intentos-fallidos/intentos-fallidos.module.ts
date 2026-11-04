import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntentosFallidos } from '../entities/entities/IntentosFallidos.js';
import { IntentosFallidosController } from './intentos-fallidos.controller.js';
import { IntentosFallidosService } from './intentos-fallidos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([IntentosFallidos])],
  controllers: [IntentosFallidosController],
  providers: [IntentosFallidosService],
  exports: [IntentosFallidosService],
})
export class IntentosFallidosModule {}
