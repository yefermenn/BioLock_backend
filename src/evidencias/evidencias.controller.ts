import { Controller, Get, Param, ParseIntPipe, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { DispositivoTokenGuard } from '../common/guards/dispositivo-token.guard.js';
import { Publico } from '../common/public.decorator.js';
import { DispositivoActual } from '../common/dispositivo.decorator.js';
import { EvidenciasService } from './evidencias.service.js';

@Controller()
export class EvidenciasController {
  constructor(private readonly evidenciasService: EvidenciasService) {}

  @Publico()
  @UseGuards(DispositivoTokenGuard)
  @Post('eventos/:id_local/foto')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const dir = resolve(process.env.PRIVATE_UPLOAD_DIR ?? './private-evidence');
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => cb(null, `${randomUUID()}.jpg`),
    }),
    limits: { fileSize: 1048576 },
  }))
  subir(
    @Param('id_local') idLocal: string,
    @UploadedFile() file: Express.Multer.File,
    @DispositivoActual() dispositivo: { id: number },
  ) {
    return this.evidenciasService.guardarFoto(dispositivo, idLocal, file);
  }

  @Get('alarmas/:id/foto')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.evidenciasService.obtenerFoto(id);
  }
}
