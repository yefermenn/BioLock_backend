import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Accesos } from '../entities/entities/Accesos.js';

type AccesosListQuery = {
  pagina?: number;
  limite?: number;
  desde?: string;
  hasta?: string;
};

@Injectable()
export class AccesosService {
  constructor(
    @InjectRepository(Accesos)
    private readonly accesosRepository: Repository<Accesos>,
  ) {}

  async list(query: AccesosListQuery = {}) {
    const pagina = Number.isFinite(query.pagina) && Number(query.pagina) > 0 ? Number(query.pagina) : 1;
    const limite = Number.isFinite(query.limite) && Number(query.limite) > 0 ? Number(query.limite) : 20;
    const skip = (pagina - 1) * limite;

    const where: Record<string, unknown> = {};

    if (query.desde && query.hasta) {
      const inicio = new Date(query.desde);
      const fin = new Date(query.hasta);
      if (!Number.isNaN(inicio.getTime()) && !Number.isNaN(fin.getTime())) {
        where.timestamp = Between(inicio, fin);
      }
    } else if (query.desde) {
      const inicio = new Date(query.desde);
      if (!Number.isNaN(inicio.getTime())) {
        where.timestamp = MoreThanOrEqual(inicio);
      }
    } else if (query.hasta) {
      const fin = new Date(query.hasta);
      if (!Number.isNaN(fin.getTime())) {
        where.timestamp = LessThanOrEqual(fin);
      }
    }

    const [items, total] = await this.accesosRepository.findAndCount({
      where,
      order: { timestamp: 'DESC' },
      relations: { usuario: true, dispositivo: true, zona: true },
      skip,
      take: limite,
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
      pagina,
      limite,
    };
  }
}
