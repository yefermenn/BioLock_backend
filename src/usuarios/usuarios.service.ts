import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Usuarios } from '../entities/entities/Usuarios.js';
import { UsuariosRoles } from '../entities/entities/UsuariosRoles.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuarios)
    private readonly usuariosRepository: Repository<Usuarios>,
    @InjectRepository(UsuariosRoles)
    private readonly usuariosRolesRepository: Repository<UsuariosRoles>,
  ) {}

  private mapUsuario(usuario: Usuarios) {
    const roles = usuario.usuariosRoles2
      ?.map((rel) => (rel.rol ? { id: rel.rol.id, nombre: rel.rol.nombre } : null))
      .filter((rol): rol is { id: number; nombre: string } => Boolean(rol)) ?? [];

    return {
      id: usuario.id,
      cedula: usuario.cedula,
      nombre: usuario.nombre,
      iniciales: usuario.nombre
        .split(' ')
        .map((parte) => parte[0]?.toUpperCase() ?? '')
        .filter(Boolean)
        .slice(0, 2)
        .join(''),
      correo: usuario.correo,
      telefono: usuario.telefono,
      activo: usuario.activo,
      biometria_registrada: usuario.biometriaRegistrada,
      fecha_registro_biometrico: usuario.fechaRegistroBiometrico,
      roles: roles.map((rol) => ({ id: rol.id, nombre: rol.nombre })),
      created_at: usuario.createdAt,
      updated_at: usuario.updatedAt,
    };
  }

  async list() {
    const [items, total] = await this.usuariosRepository.findAndCount({
      order: { id: 'DESC' },
      relations: { usuariosRoles2: { rol: true } },
      take: 20,
    });

    return {
      items: items.map((usuario) => this.mapUsuario(usuario)),
      total,
      pagina: 1,
      limite: 20,
    };
  }

  async asignarRol(usuarioId: number, rolId: number) {
    const existe = await this.usuariosRolesRepository.findOne({
      where: { usuarioId, rolId },
    });

    if (!existe) {
      await this.usuariosRolesRepository.save({ usuarioId, rolId, activo: true });
    }

    return { ok: true, usuario_id: usuarioId, rol_id: rolId };
  }

  async quitarRol(usuarioId: number, rolId: number) {
    await this.usuariosRolesRepository.delete({ usuarioId, rolId });
    return { ok: true, usuario_id: usuarioId, rol_id: rolId };
  }

  async restablecerPassword(id: number, nuevaPassword: string) {
    const usuario = await this.usuariosRepository.findOne({ where: { id } });
    if (!usuario) {
      return null;
    }

    usuario.passwordHash = await bcrypt.hash(nuevaPassword, Number(process.env.BCRYPT_ROUNDS ?? 10));
    await this.usuariosRepository.save(usuario);

    return { ok: true, id, mensaje: 'Contraseña restablecida.' };
  }

  async findById(id: number) {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
      relations: { usuariosRoles2: { rol: true } },
    });

    if (!usuario) {
      return null;
    }

    return this.mapUsuario(usuario);
  }

  async create(dto: Record<string, unknown>) {
    const usuario = this.usuariosRepository.create({
      cedula: String(dto.cedula ?? ''),
      nombre: String(dto.nombre ?? ''),
      correo: String(dto.correo ?? '').toLowerCase(),
      telefono: dto.telefono ? String(dto.telefono) : null,
      activo: true,
      biometriaRegistrada: false,
      passwordHash: dto.password
        ? await bcrypt.hash(String(dto.password), Number(process.env.BCRYPT_ROUNDS ?? 10))
        : null,
    });

    const guardado = await this.usuariosRepository.save(usuario);
    return { ok: true, data: this.mapUsuario(guardado) };
  }

  async update(id: number, dto: Record<string, unknown>) {
    const usuario = await this.usuariosRepository.findOne({ where: { id } });
    if (!usuario) {
      return null;
    }

    Object.assign(usuario, {
      nombre: dto.nombre ? String(dto.nombre) : usuario.nombre,
      correo: dto.correo ? String(dto.correo).toLowerCase() : usuario.correo,
      telefono: dto.telefono !== undefined ? String(dto.telefono) : usuario.telefono,
      activo: dto.activo !== undefined ? Boolean(dto.activo) : usuario.activo,
    });

    const actualizado = await this.usuariosRepository.save(usuario);
    return { ok: true, id, data: this.mapUsuario(actualizado) };
  }

  async cambiarEstado(id: number, activo: boolean) {
    await this.usuariosRepository.update(id, { activo });
    return { ok: true, id, activo };
  }
}
