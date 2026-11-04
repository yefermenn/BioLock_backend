import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Permisos } from '../entities/entities/Permisos.js';
import { Roles } from '../entities/entities/Roles.js';
import { RolesPermisos } from '../entities/entities/RolesPermisos.js';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
    @InjectRepository(Permisos)
    private readonly permisosRepository: Repository<Permisos>,
    @InjectRepository(RolesPermisos)
    private readonly rolesPermisosRepository: Repository<RolesPermisos>,
    private readonly dataSource: DataSource,
  ) {}

  async list() {
    const [items, total] = await this.rolesRepository.findAndCount({
      order: { id: 'ASC' },
      relations: { rolesPermisos: { permiso: true } },
    });

    return {
      items: items.map((rol) => ({
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        activo: rol.activo,
        permisos: rol.rolesPermisos?.map((rp) => rp.permiso?.codigo).filter(Boolean) ?? [],
      })),
      total,
    };
  }

  async findById(id: number) {
    const rol = await this.rolesRepository.findOne({
      where: { id },
      relations: { rolesPermisos: { permiso: true } },
    });

    if (!rol) {
      return null;
    }

    return {
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      activo: rol.activo,
      permisos: rol.rolesPermisos?.map((rp) => rp.permiso?.codigo).filter(Boolean) ?? [],
    };
  }

  async create(dto: Record<string, unknown>) {
    const rol = this.rolesRepository.create({
      nombre: String(dto.nombre ?? ''),
      descripcion: dto.descripcion ? String(dto.descripcion) : null,
      activo: true,
    });
    const guardado = await this.rolesRepository.save(rol);
    return { ok: true, data: guardado };
  }

  async update(id: number, dto: Record<string, unknown>) {
    await this.rolesRepository.update(id, {
      nombre: dto.nombre ? String(dto.nombre) : undefined,
      descripcion: dto.descripcion !== undefined ? String(dto.descripcion) : undefined,
      activo: dto.activo !== undefined ? Boolean(dto.activo) : undefined,
    });
    return { ok: true, id, data: dto };
  }

  async reemplazarPermisos(id: number, permisos: number[]) {
    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(RolesPermisos).delete({ rolId: id });
      if (permisos.length > 0) {
        await manager.getRepository(RolesPermisos).save(
          permisos.map((permisoId) => ({ rolId: id, permisoId })),
        );
      }
    });

    return { ok: true, id, permisos };
  }
}
