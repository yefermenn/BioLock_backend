import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import { Configuracion } from '../entities/entities/Configuracion.js';
import { Dispositivos } from '../entities/entities/Dispositivos.js';

@Injectable()
export class DispositivosService {
  constructor(
    @InjectRepository(Dispositivos)
    private readonly dispositivosRepository: Repository<Dispositivos>,
    @InjectRepository(Configuracion)
    private readonly configuracionRepository: Repository<Configuracion>,
  ) {}

  private calcularEnLinea(dispositivo: Dispositivos) {
    if (!dispositivo.ultimaConexion) {
      return false;
    }

    const diffMs = Date.now() - new Date(dispositivo.ultimaConexion).getTime();
    return dispositivo.activo && diffMs < 120000;
  }

  async list() {
    const dispositivos = await this.dispositivosRepository.find({
      order: { id: 'DESC' },
      relations: { dispositivosZonas: { zona: true }, configuracion: true },
    });

    return {
      items: dispositivos.map((dispositivo) => ({
        id: dispositivo.id,
        nombre: dispositivo.nombre,
        codigo_serie: dispositivo.codigoSerie,
        ubicacion: dispositivo.ubicacion,
        estado: dispositivo.estado,
        activo: dispositivo.activo,
        en_linea: this.calcularEnLinea(dispositivo),
        ultima_conexion: dispositivo.ultimaConexion,
        zonas: dispositivo.dispositivosZonas?.map((dz) => dz.zona?.nombre).filter(Boolean) ?? [],
      })),
      total: dispositivos.length,
    };
  }

  async findById(id: number) {
    const dispositivo = await this.dispositivosRepository.findOne({
      where: { id },
      relations: { dispositivosZonas: { zona: true }, configuracion: true },
    });

    if (!dispositivo) {
      return null;
    }

    return {
      id: dispositivo.id,
      nombre: dispositivo.nombre,
      codigo_serie: dispositivo.codigoSerie,
      ubicacion: dispositivo.ubicacion,
      estado: dispositivo.estado,
      activo: dispositivo.activo,
      en_linea: this.calcularEnLinea(dispositivo),
      ultima_conexion: dispositivo.ultimaConexion,
      zonas: dispositivo.dispositivosZonas?.map((dz) => ({
        id: dz.zonaId,
        nombre: dz.zona?.nombre,
        activo: dz.activo,
      })) ?? [],
      configuracion: dispositivo.configuracion,
    };
  }

  async create(dto: Record<string, unknown>) {
    const token = randomBytes(32).toString('base64url');
    const hash = createHash('sha256').update(token).digest('hex');

    const dispositivo = this.dispositivosRepository.create({
      nombre: String(dto.nombre ?? ''),
      codigoSerie: String(dto.codigo_serie ?? ''),
      ubicacion: String(dto.ubicacion ?? ''),
      ipLocal: dto.ip_local ? String(dto.ip_local) : null,
      estado: 'offline',
      activo: true,
      tokenHash: hash,
    });

    const guardado = await this.dispositivosRepository.save(dispositivo);
    return { ok: true, token, data: guardado };
  }

  async update(id: number, dto: Record<string, unknown>) {
    const dispositivo = await this.dispositivosRepository.findOne({ where: { id } });
    if (!dispositivo) {
      return null;
    }

    Object.assign(dispositivo, {
      nombre: dto.nombre ? String(dto.nombre) : dispositivo.nombre,
      ubicacion: dto.ubicacion ? String(dto.ubicacion) : dispositivo.ubicacion,
      ipLocal: dto.ip_local !== undefined ? String(dto.ip_local) : dispositivo.ipLocal,
      estado: dto.estado ? String(dto.estado) : dispositivo.estado,
      activo: dto.activo !== undefined ? Boolean(dto.activo) : dispositivo.activo,
    });

    const actualizado = await this.dispositivosRepository.save(dispositivo);
    return { ok: true, id, data: actualizado };
  }

  async regenerarToken(id: number) {
    const dispositivo = await this.dispositivosRepository.findOne({ where: { id } });
    if (!dispositivo) {
      return null;
    }

    const token = randomBytes(32).toString('base64url');
    const hash = createHash('sha256').update(token).digest('hex');
    await this.dispositivosRepository.update(id, { tokenHash: hash });
    return { ok: true, token };
  }

  async actualizarBiometriaPorToken(authorization: string | undefined, usuarioIds: number[]) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { ok: false, error: 'no_autenticado', mensaje: 'Falta el token del dispositivo.' };
    }

    const token = authorization.replace('Bearer ', '').trim();
    const hash = createHash('sha256').update(token).digest('hex');
    const dispositivo = await this.dispositivosRepository.findOne({
      where: { tokenHash: hash },
    });

    if (!dispositivo) {
      return { ok: false, error: 'no_autenticado', mensaje: 'El token del dispositivo no es válido.' };
    }

    const ids = [...new Set(usuarioIds.filter((id) => Number.isInteger(id) && id > 0))];
    const ahora = new Date();

    if (ids.length > 0) {
      await this.dispositivosRepository.manager.query(
        `UPDATE public.usuarios
         SET biometria_registrada = TRUE,
             fecha_registro_biometrico = $1
         WHERE id = ANY($2)`,
        [ahora, ids],
      );

      await this.dispositivosRepository.manager.query(
        `UPDATE public.usuarios
         SET biometria_registrada = FALSE,
             fecha_registro_biometrico = NULL
         WHERE activo = TRUE
           AND biometria_registrada = TRUE
           AND id <> ALL($1)`,
        [ids],
      );
    } else {
      await this.dispositivosRepository.manager.query(
        `UPDATE public.usuarios
         SET biometria_registrada = FALSE,
             fecha_registro_biometrico = NULL
         WHERE activo = TRUE AND biometria_registrada = TRUE`,
      );
    }

    return {
      ok: true,
      dispositivo_id: dispositivo.id,
      usuario_ids: ids,
      actualizado_en: ahora.toISOString(),
    };
  }
}
