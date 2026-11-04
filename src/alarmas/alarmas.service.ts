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

  async list() {
    const [items, total] = await this.alarmasRepository.findAndCount({
      order: { timestamp: 'DESC' },
      relations: { zona: true, dispositivo: true },
      take: 20,
    });

    return {
      items: items.map((alarma) => ({
        id: alarma.id,
        estado: alarma.estado,
        fecha: alarma.timestamp,
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
      relations: { zona: true, dispositivo: true, intentosFallidos: true },
    });

    if (!alarma) {
      return null;
    }

    return {
      id: alarma.id,
      estado: alarma.estado,
      observaciones: alarma.observaciones,
      fecha: alarma.timestamp,
      zona: alarma.zona ? { id: alarma.zona.id, nombre: alarma.zona.nombre } : null,
      dispositivo: alarma.dispositivo ? { id: alarma.dispositivo.id, nombre: alarma.dispositivo.nombre } : null,
      intentos_fallidos: alarma.intentosFallidos ?? [],
    };
  }

  async resolver(id: number, dto: Record<string, unknown>) {
    const alarma = await this.alarmasRepository.findOne({ where: { id } });
    if (!alarma) {
      return null;
    }

    if (alarma.estado !== 'activa') {
      return { ok: false, error: 'conflicto', mensaje: 'La alarma ya fue resuelta.' };
    }

    alarma.estado = String(dto.estado ?? 'resuelta');
    alarma.observaciones = dto.observaciones !== undefined ? String(dto.observaciones) : alarma.observaciones;
    alarma.resueltaEn = new Date();
    alarma.resueltaPor = dto.resuelta_por !== undefined ? Number(dto.resuelta_por) : alarma.resueltaPor;
    await this.alarmasRepository.save(alarma);

    return { ok: true, id, estado: alarma.estado };
  }

  async conteo() {
    const total = await this.alarmasRepository.count({ where: { estado: 'activa' } });
    return { activas: total };
  }
}
