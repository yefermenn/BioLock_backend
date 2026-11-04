import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zonas } from '../entities/entities/Zonas.js';

@Injectable()
export class ZonasService {
  constructor(
    @InjectRepository(Zonas)
    private readonly zonasRepository: Repository<Zonas>,
  ) {}

  async list() {
    const [items, total] = await this.zonasRepository.findAndCount({
      order: { nombre: 'ASC' },
      relations: { dispositivosZonas: true, horariosAccesos: true },
    });

    return {
      items: items.map((zona) => ({
        id: zona.id,
        nombre: zona.nombre,
        descripcion: zona.descripcion,
        nivel_seguridad: zona.nivelSeguridad,
        activa: zona.activa,
        dispositivos: zona.dispositivosZonas?.length ?? 0,
        horarios: zona.horariosAccesos?.length ?? 0,
      })),
      total,
    };
  }

  async findById(id: number) {
    const zona = await this.zonasRepository.findOne({
      where: { id },
      relations: { dispositivosZonas: { dispositivo: true }, horariosAccesos: true },
    });

    if (!zona) {
      return null;
    }

    return {
      id: zona.id,
      nombre: zona.nombre,
      descripcion: zona.descripcion,
      nivel_seguridad: zona.nivelSeguridad,
      activa: zona.activa,
      dispositivos: zona.dispositivosZonas?.map((dz) => ({
        id: dz.dispositivoId,
        nombre: dz.dispositivo?.nombre,
        activo: dz.activo,
      })) ?? [],
      horarios: zona.horariosAccesos ?? [],
    };
  }

  async create(dto: Record<string, unknown>) {
    const zona = this.zonasRepository.create({
      nombre: String(dto.nombre ?? ''),
      descripcion: dto.descripcion ? String(dto.descripcion) : null,
      nivelSeguridad: Number(dto.nivel_seguridad ?? 1),
      activa: true,
    });

    const guardada = await this.zonasRepository.save(zona);
    return { ok: true, data: guardada };
  }

  async update(id: number, dto: Record<string, unknown>) {
    const zona = await this.zonasRepository.findOne({ where: { id } });
    if (!zona) {
      return null;
    }

    Object.assign(zona, {
      nombre: dto.nombre ? String(dto.nombre) : zona.nombre,
      descripcion: dto.descripcion !== undefined ? String(dto.descripcion) : zona.descripcion,
      nivelSeguridad: dto.nivel_seguridad !== undefined ? Number(dto.nivel_seguridad) : zona.nivelSeguridad,
      activa: dto.activa !== undefined ? Boolean(dto.activa) : zona.activa,
    });

    const actualizada = await this.zonasRepository.save(zona);
    return { ok: true, id, data: actualizada };
  }
}
