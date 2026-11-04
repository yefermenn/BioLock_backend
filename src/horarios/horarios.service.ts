import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HorariosAcceso } from '../entities/entities/HorariosAcceso.js';

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(HorariosAcceso)
    private readonly horariosRepository: Repository<HorariosAcceso>,
  ) {}

  async list(zonaId: number) {
    const horarios = await this.horariosRepository.find({
      where: { zonaId },
      order: { diaSemana: 'ASC', horaInicio: 'ASC' },
    });

    return {
      zona_id: zonaId,
      horarios: horarios.map((horario) => ({
        id: horario.id,
        dia_semana: horario.diaSemana,
        hora_inicio: horario.horaInicio,
        hora_fin: horario.horaFin,
        activo: horario.activo,
      })),
    };
  }

  async create(zonaId: number, dto: Record<string, unknown>) {
    const horario = this.horariosRepository.create({
      zonaId,
      diaSemana: Number(dto.dia_semana ?? 0),
      horaInicio: String(dto.hora_inicio ?? '00:00'),
      horaFin: String(dto.hora_fin ?? '00:00'),
      activo: dto.activo !== undefined ? Boolean(dto.activo) : true,
    });

    const guardado = await this.horariosRepository.save(horario);
    return { ok: true, zona_id: zonaId, data: guardado };
  }

  async update(id: number, dto: Record<string, unknown>) {
    const horario = await this.horariosRepository.findOne({ where: { id } });
    if (!horario) {
      return null;
    }

    Object.assign(horario, {
      diaSemana: dto.dia_semana !== undefined ? Number(dto.dia_semana) : horario.diaSemana,
      horaInicio: dto.hora_inicio ? String(dto.hora_inicio) : horario.horaInicio,
      horaFin: dto.hora_fin ? String(dto.hora_fin) : horario.horaFin,
      activo: dto.activo !== undefined ? Boolean(dto.activo) : horario.activo,
    });

    const actualizado = await this.horariosRepository.save(horario);
    return { ok: true, id, data: actualizado };
  }

  async remove(id: number) {
    await this.horariosRepository.delete(id);
    return { ok: true, eliminado: id };
  }
}
