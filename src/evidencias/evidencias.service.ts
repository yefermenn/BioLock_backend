import { BadRequestException, GoneException, Injectable, NotFoundException, StreamableFile, UnauthorizedException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { createReadStream, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DataSource } from 'typeorm';

@Injectable()
export class EvidenciasService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  guardarFoto(dispositivo: { id: number }, idLocal: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException({ error: 'archivo_requerido', mensaje: 'Debe enviar una imagen JPEG.' });
    if (file.mimetype !== 'image/jpeg') throw new BadRequestException({ error: 'archivo_invalido', mensaje: 'Solo se permiten imágenes JPEG.' });
    if (file.size > 1048576) throw new BadRequestException({ error: 'archivo_demasiado_grande', mensaje: 'La imagen supera el máximo de 1 MB.' });
    return this.guardarAsociada(dispositivo.id, idLocal, file);
  }

  private async guardarAsociada(dispositivoId: number, idLocal: string, file: Express.Multer.File) {
    const numeroId = Number(idLocal);
    let alarmaId: number | null = null;
    let intentoId: number | null = null;

    if (Number.isFinite(numeroId) && numeroId > 0) {
      const alarma = await this.dataSource.query(
        'SELECT id FROM public.alarmas WHERE id = $1 AND dispositivo_id = $2 LIMIT 1', [numeroId, dispositivoId],
      );
      if (alarma?.length) alarmaId = Number(alarma[0].id);
    }

    const intentos = await this.dataSource.query(
      `SELECT id, alarma_id FROM public.intentos_fallidos
       WHERE dispositivo_id = $1 AND id_local = $2
       AND motivo = 'denegado' LIMIT 1`, [dispositivoId, idLocal],
    ).catch(async () => this.dataSource.query(
      `SELECT id, alarma_id FROM public.intentos_fallidos
       WHERE dispositivo_id = $1 AND motivo = 'denegado'
       ORDER BY timestamp DESC LIMIT 1`, [dispositivoId],
    ));

    if (intentos?.length) {
      intentoId = Number(intentos[0].id);
      alarmaId = intentos[0].alarma_id ? Number(intentos[0].alarma_id) : alarmaId;
    }

    if (!alarmaId && !intentoId) {
      throw new BadRequestException({ error: 'evento_invalido', mensaje: 'El id_local no corresponde a un evento denegado o una alarma de este dispositivo.' });
    }

    const expiraEn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.dataSource.query(
      `INSERT INTO public.evidencias_intrusos
       (dispositivo_id, intento_id, alarma_id, id_local, ruta_archivo, mime_tipo, expira_en)
       VALUES ($1,$2,$3,$4,$5,'image/jpeg',$6)
       ON CONFLICT (alarma_id) DO UPDATE SET
         intento_id=EXCLUDED.intento_id, id_local=EXCLUDED.id_local,
         ruta_archivo=EXCLUDED.ruta_archivo, creada_en=NOW(), expira_en=EXCLUDED.expira_en,
         expirada=false`,
      [dispositivoId, intentoId, alarmaId, idLocal, file.path, expiraEn],
    );
    return { ok: true, id_local: idLocal, expira_en: expiraEn };
  }

  async obtenerFoto(alarmaId: number): Promise<StreamableFile> {
    const filas = await this.dataSource.query(
      'SELECT * FROM public.evidencias_intrusos WHERE alarma_id = $1 LIMIT 1', [alarmaId],
    );
    if (!filas?.length) {
      throw new NotFoundException({ error: 'foto_no_encontrada', mensaje: 'La alarma nunca tuvo una fotografía.' });
    }
    const foto = filas[0];
    if (foto.expirada || new Date(foto.expira_en).getTime() <= Date.now()) {
      await this.marcarExpirada(foto);
      throw new GoneException({ error: 'foto_expirada', mensaje: 'La fotografía ya expiró.' });
    }
    if (!existsSync(foto.ruta_archivo)) {
      await this.marcarExpirada(foto);
      throw new GoneException({ error: 'foto_expirada', mensaje: 'La fotografía ya fue eliminada.' });
    }
    return new StreamableFile(createReadStream(foto.ruta_archivo), { type: 'image/jpeg' });
  }

  private async marcarExpirada(foto: any) {
    if (existsSync(foto.ruta_archivo)) unlinkSync(foto.ruta_archivo);
    await this.dataSource.query('UPDATE public.evidencias_intrusos SET expirada=true WHERE id=$1', [foto.id]);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expirarFotos() {
    mkdirSync(resolve(process.env.PRIVATE_UPLOAD_DIR ?? './private-evidence'), { recursive: true });
    const filas = await this.dataSource.query(
      `SELECT * FROM public.evidencias_intrusos
       WHERE expirada=false AND expira_en <= NOW()`,
    );
    for (const foto of filas ?? []) await this.marcarExpirada(foto);
  }
}
