import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alarmas } from '../entities/entities/Alarmas.js';

@Injectable()
export class AlarmasService {
  constructor(
    @InjectRepository(Alarmas)
    private readonly alarmasRepository: Repository<Alarmas>,
  ) {}

  private mapResueltaPor(alarma: Partial<{ resueltaPor: number | null; resueltaPor2?: { id: number; nombre: string } }>) {
    if (alarma.resueltaPor === null || alarma.resueltaPor === undefined) {
      return null;
    }

    if (alarma.resueltaPor2) {
      return {
        id: alarma.resueltaPor2.id,
        nombre: alarma.resueltaPor2.nombre,
      };
    }

    return {
      id: alarma.resueltaPor,
      nombre: null,
    };
  }

  async list() {
    const [items, total] = await this.alarmasRepository.findAndCount({
      order: { timestamp: 'DESC' },
      relations: { zona: true, dispositivo: true, resueltaPor2: true },
      take: 20,
    });

    return {
      items: items.map((alarma) => ({
        id: alarma.id,
        estado: alarma.estado,
        fecha: alarma.timestamp,
        observaciones: alarma.observaciones,
        observaciones_resolucion: null,
        resuelta_por: this.mapResueltaPor(alarma),
        resuelta_en: alarma.resueltaEn,
        fecha_resolucion: alarma.resueltaEn,
        zona: alarma.zona ? { id: alarma.zona.id, nombre: alarma.zona.nombre } : null,
        dispositivo: alarma.dispositivo ? { id: alarma.dispositivo.id, nombre: alarma.dispositivo.nombre } : null,
      })),
      total,
      pagina: 1,
      limite: 20,
    };
  }

  async findById(id: number) {
    const alarma = await this.alarmasRepository.findOne({
      where: { id },
      relations: { zona: true, dispositivo: true, intentosFallidos: true, resueltaPor2: true },
    });

    if (!alarma) {
      return null;
    }

    return {
      id: alarma.id,
      estado: alarma.estado,
      observaciones: alarma.observaciones,
      observaciones_resolucion: null,
      nota_resolucion: null,
      resuelta_por: this.mapResueltaPor(alarma),
      resuelta_en: alarma.resueltaEn,
      fecha_resolucion: alarma.resueltaEn,
      fecha: alarma.timestamp,
      zona: alarma.zona ? { id: alarma.zona.id, nombre: alarma.zona.nombre } : null,
      dispositivo: alarma.dispositivo ? { id: alarma.dispositivo.id, nombre: alarma.dispositivo.nombre } : null,
      intentos_fallidos: (alarma.intentosFallidos ?? []).map((item) => ({
        id: item.id,
        dispositivo_id: item.dispositivoId,
        score_obtenido: item.scoreObtenido,
        timestamp: item.timestamp,
      })),
    };
  }

  async resolver(id: number, dto: Record<string, unknown>, usuarioActual?: { id?: number; nombre?: string } | null) {
    const alarma = await this.alarmasRepository.findOne({ where: { id } });
    if (!alarma) {
      return null;
    }

    if (alarma.estado !== 'activa') {
      return { ok: false, error: 'conflicto', mensaje: 'La alarma ya fue resuelta.' };
    }

    const fechaResolucion = new Date();
    const usuarioId = usuarioActual?.id ?? (dto.resuelta_por !== undefined ? Number(dto.resuelta_por) : null);

    alarma.estado = String(dto.estado ?? 'resuelta');
    alarma.resueltaEn = fechaResolucion;
    alarma.resueltaPor = usuarioId !== null && Number.isFinite(usuarioId) ? Number(usuarioId) : alarma.resueltaPor;
    await this.alarmasRepository.save(alarma);

    return {
      ok: true,
      id,
      estado: alarma.estado,
      resuelta_por: alarma.resueltaPor,
      resuelta_en: alarma.resueltaEn,
      observaciones_resolucion: null,
      nota_resolucion: null,
      fecha_resolucion: alarma.resueltaEn,
    };
  }

  async conteo() {
    const total = await this.alarmasRepository.count({ where: { estado: 'activa' } });
    return { activas: total };
  }
}
