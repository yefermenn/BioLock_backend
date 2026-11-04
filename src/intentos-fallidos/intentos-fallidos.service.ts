import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IntentosFallidos } from '../entities/entities/IntentosFallidos.js';

@Injectable()
export class IntentosFallidosService {
  constructor(
    @InjectRepository(IntentosFallidos)
    private readonly intentosRepository: Repository<IntentosFallidos>,
  ) {}

  async list() {
    const [items, total] = await this.intentosRepository.findAndCount({
      order: { timestamp: 'DESC' },
      relations: { dispositivo: true, zona: true, usuario: true },
      take: 20,
    });

    return {
      items: items.map((intento) => ({
        id: String(intento.id),
        fecha: intento.timestamp,
        motivo: intento.motivo,
        score_obtenido: intento.scoreObtenido ? Number(intento.scoreObtenido) : null,
        dispositivo: intento.dispositivo ? { id: intento.dispositivo.id, nombre: intento.dispositivo.nombre } : null,
        zona: intento.zona ? { id: intento.zona.id, nombre: intento.zona.nombre } : null,
        usuario: intento.usuario ? { id: intento.usuario.id, nombre: intento.usuario.nombre } : null,
        alarma_id: intento.alarmaId,
        tiene_foto: !!intento.fotoRuta,
      })),
      total,
      pagina: 1,
      limite: 20,
    };
  }
}
