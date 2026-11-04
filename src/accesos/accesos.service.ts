import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Accesos } from '../entities/entities/Accesos.js';

@Injectable()
export class AccesosService {
  constructor(
    @InjectRepository(Accesos)
    private readonly accesosRepository: Repository<Accesos>,
  ) {}

  async list() {
    const [items, total] = await this.accesosRepository.findAndCount({
      order: { timestamp: 'DESC' },
      relations: { usuario: true, dispositivo: true, zona: true },
      take: 20,
    });

    return {
      items: items.map((acceso) => ({
        id: String(acceso.id),
        fecha: acceso.timestamp,
        tipo_acceso: acceso.tipoAcceso,
        usuario: acceso.usuario
          ? { id: acceso.usuario.id, nombre: acceso.usuario.nombre, iniciales: acceso.usuario.nombre.split(' ').map((p) => p[0]?.toUpperCase() ?? '').slice(0, 2).join('') }
          : null,
        dispositivo: acceso.dispositivo ? { id: acceso.dispositivo.id, nombre: acceso.dispositivo.nombre } : null,
        zona: acceso.zona ? { id: acceso.zona.id, nombre: acceso.zona.nombre } : null,
        score_biometrico: acceso.scoreBiometrico ? Number(acceso.scoreBiometrico) : null,
      })),
      total,
      pagina: 1,
      limite: 20,
    };
  }
}
