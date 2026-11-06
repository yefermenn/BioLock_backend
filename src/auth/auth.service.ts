import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import { Permisos } from '../entities/entities/Permisos.js';
import { Roles } from '../entities/entities/Roles.js';
import { RolesPermisos } from '../entities/entities/RolesPermisos.js';
import { Sesiones } from '../entities/entities/Sesiones.js';
import { Usuarios } from '../entities/entities/Usuarios.js';
import { UsuariosRoles } from '../entities/entities/UsuariosRoles.js';
import { AuditoriaService } from '../auditoria/auditoria.service.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuarios)
    private readonly usuariosRepository: Repository<Usuarios>,
    @InjectRepository(Sesiones)
    private readonly sesionesRepository: Repository<Sesiones>,
    @InjectRepository(UsuariosRoles)
    private readonly usuariosRolesRepository: Repository<UsuariosRoles>,
    @InjectRepository(RolesPermisos)
    private readonly rolesPermisosRepository: Repository<RolesPermisos>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  private async getRolesUsuario(usuarioId: number): Promise<string[]> {
    const rows = await this.usuariosRolesRepository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.rol', 'rol')
      .where('ur.usuarioId = :usuarioId', { usuarioId })
      .andWhere('rol.activo = :activo', { activo: true })
      .getMany();

    return rows.map((row) => row.rol?.nombre).filter(Boolean) as string[];
  }

  private async getPermisosUsuario(usuarioId: number): Promise<string[]> {
    const rows = await this.rolesPermisosRepository
      .createQueryBuilder('rp')
      .leftJoinAndSelect('rp.permiso', 'permiso')
      .leftJoin('rp.rol', 'rol')
      .leftJoin('usuarios_roles', 'ur', 'ur.rol_id = rol.id AND ur.usuario_id = :usuarioId', {
        usuarioId,
      })
      .where('ur.usuario_id = :usuarioId', { usuarioId })
      .andWhere('rol.activo = :activo', { activo: true })
      .getMany();

    return rows
      .map((row) => row.permiso?.codigo)
      .filter((codigo): codigo is string => Boolean(codigo));
  }

  private async getUsuarioPerfil(usuarioId: number) {
    const usuario = await this.usuariosRepository.findOne({
      where: { id: usuarioId },
      relations: { usuariosRoles2: { rol: true } },
    });

    if (!usuario) {
      return null;
    }

    const roles = usuario.usuariosRoles2
      ?.map((rel) => rel.rol?.nombre)
      .filter((nombre): nombre is string => Boolean(nombre)) ?? [];

    const permisos = await this.getPermisosUsuario(usuarioId);

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      roles,
      permisos,
    };
  }

  async login(usuario: string, contrasena: string, ipOrigen?: string, userAgent?: string) {
    const valor = usuario?.trim();
    if (!valor || !contrasena) {
      throw new UnauthorizedException({
        error: 'credenciales_invalidas',
        mensaje: 'Credenciales inválidas.',
      });
    }

    const usuarioEncontrado = await this.usuariosRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.passwordHash')
      .where('LOWER(usuario.correo) = :valor', { valor: valor.toLowerCase() })
      .orWhere('usuario.cedula = :valor', { valor })
      .getOne();

    if (
      !usuarioEncontrado ||
      !usuarioEncontrado.activo ||
      !usuarioEncontrado.passwordHash ||
      !(await bcrypt.compare(contrasena, usuarioEncontrado.passwordHash))
    ) {
      throw new UnauthorizedException({
        error: 'credenciales_invalidas',
        mensaje: 'Credenciales inválidas.',
      });
    }

    const roles = await this.getRolesUsuario(usuarioEncontrado.id);
    if (roles.length === 0) {
      throw new ForbiddenException({
        error: 'sin_permiso',
        mensaje: 'El usuario no tiene permisos de acceso al panel.',
      });
    }

    const permisos = await this.getPermisosUsuario(usuarioEncontrado.id);
    await this.auditoriaService.registrar({
      usuarioId: usuarioEncontrado.id,
      accion: 'LOGIN',
      tablaAfectada: 'auth',
      registroId: usuarioEncontrado.id,
      ip: ipOrigen ?? null,
      detalle: {
        metodo: 'login',
        usuario: usuarioEncontrado.nombre,
        correo: usuarioEncontrado.correo,
      },
    });
    const payload = {
      sub: usuarioEncontrado.id,
      roles,
      permisos,
    };

    const secret = String(process.env.JWT_SECRET ?? 'dev-secret-key-for-local-32chars');
    const accessToken = jwt.sign(payload, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'],
    });
    const refreshToken = randomBytes(32).toString('hex');
    const refreshHash = createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + Number(process.env.REFRESH_EXPIRES_DAYS ?? 30) * 86400000);

    await this.sesionesRepository.save({
      usuarioId: usuarioEncontrado.id,
      tokenJti: refreshHash.slice(0, 64),
      ipOrigen: ipOrigen ?? null,
      userAgent: userAgent ?? null,
      expiraEn: expiresAt,
      revocada: false,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      usuario: {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        correo: usuarioEncontrado.correo,
        roles,
        permisos,
      },
    };
  }

  async refresh(refreshToken: string, ipOrigen?: string, userAgent?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException({
        error: 'no_autenticado',
        mensaje: 'Refresh token inválido.',
      });
    }

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const sesion = await this.sesionesRepository.findOne({
      where: {
        tokenJti: tokenHash.slice(0, 64),
        revocada: false,
      },
    });

    if (!sesion || sesion.expiraEn <= new Date()) {
      throw new UnauthorizedException({
        error: 'expirado',
        mensaje: 'El refresh token expiró o fue revocado.',
      });
    }

    const usuario = await this.usuariosRepository.findOne({ where: { id: sesion.usuarioId } });
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException({
        error: 'credenciales_invalidas',
        mensaje: 'Credenciales inválidas.',
      });
    }

    const roles = await this.getRolesUsuario(usuario.id);
    const permisos = await this.getPermisosUsuario(usuario.id);
    const secret = String(process.env.JWT_SECRET ?? 'dev-secret-key-for-local-32chars');
    const accessToken = jwt.sign(
      { sub: usuario.id, roles, permisos },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'] },
    );
    const nuevoRefreshToken = randomBytes(32).toString('hex');
    const nuevoHash = createHash('sha256').update(nuevoRefreshToken).digest('hex');

    await this.sesionesRepository.update(sesion.id, {
      revocada: true,
      revocadaEn: new Date(),
    });

    await this.sesionesRepository.save({
      usuarioId: usuario.id,
      tokenJti: nuevoHash.slice(0, 64),
      ipOrigen: ipOrigen ?? sesion.ipOrigen,
      userAgent: userAgent ?? sesion.userAgent,
      expiraEn: new Date(Date.now() + Number(process.env.REFRESH_EXPIRES_DAYS ?? 30) * 86400000),
      revocada: false,
    });

    return {
      access_token: accessToken,
      refresh_token: nuevoRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      return;
    }

    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    await this.sesionesRepository.update(
      { tokenJti: tokenHash.slice(0, 64) },
      { revocada: true, revocadaEn: new Date() },
    );
  }

  async me(usuarioId: number) {
    return this.getUsuarioPerfil(usuarioId);
  }

  async cambiarPassword(usuarioId: number, actual: string, nueva: string) {
    const usuario = await this.usuariosRepository
      .createQueryBuilder('usuario')
      .addSelect('usuario.passwordHash')
      .where('usuario.id = :id', { id: usuarioId })
      .getOne();

    if (!usuario || !usuario.passwordHash || !(await bcrypt.compare(actual, usuario.passwordHash))) {
      throw new UnauthorizedException({
        error: 'credenciales_invalidas',
        mensaje: 'La contraseña actual no coincide.',
      });
    }

    if (!nueva || nueva.length < 8) {
      throw new UnauthorizedException({
        error: 'validacion',
        mensaje: 'La nueva contraseña debe tener al menos 8 caracteres.',
      });
    }

    const passwordHash = await bcrypt.hash(nueva, Number(process.env.BCRYPT_ROUNDS ?? 10));
    await this.usuariosRepository.update(usuarioId, { passwordHash });
    await this.sesionesRepository.update({ usuarioId }, { revocada: true, revocadaEn: new Date() });
  }
}
