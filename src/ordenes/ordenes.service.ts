import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriaService } from '../auditoria/auditoria.service.js';
import { Dispositivos } from '../entities/entities/Dispositivos.js';
import { OrdenApertura } from '../entities/entities/OrdenApertura.js';
import { Usuarios } from '../entities/entities/Usuarios.js';
import { ResultadoOrdenDto } from './dto/resultado-orden.dto.js';

@Injectable()
export class OrdenesService {
  private readonly timeoutMs = Number(process.env.APERTURA_REMOTA_TIMEOUT_MS ?? 120000);

  constructor(
    @InjectRepository(OrdenApertura)
    private readonly ordenesRepository: Repository<OrdenApertura>,
    @InjectRepository(Dispositivos)
    private readonly dispositivosRepository: Repository<Dispositivos>,
    @InjectRepository(Usuarios)
    private readonly usuariosRepository: Repository<Usuarios>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  private estaConectado(dispositivo: Dispositivos): boolean {
    if (!dispositivo.activo || !dispositivo.ultimaConexion) return false;
    return dispositivo.activo && Date.now() - new Date(dispositivo.ultimaConexion).getTime() < 120000;
  }

  async crearAperturaRemota(dispositivoId: number, usuarioId: number) {
    const dispositivo = await this.dispositivosRepository.findOne({ where: { id: dispositivoId } });
    if (!dispositivo) throw new NotFoundException({ error: 'dispositivo_no_encontrado', mensaje: 'El dispositivo no existe.' });

    if (!this.estaConectado(dispositivo)) {
      throw new ConflictException({ error: 'dispositivo_desconectado', mensaje: 'El dispositivo está desconectado.' });
    }

    const orden = await this.ordenesRepository.save(
      this.ordenesRepository.create({
        dispositivoId,
        usuarioId,
        estado: 'pendiente',
        creadaEn: new Date(),
        ejecutadaEn: null,
        duracionS: null,
        mensaje: null,
      }),
    );

    return { orden_id: orden.id };
  }

  async consultarOrden(ordenId: number) {
    const orden = await this.ordenesRepository.findOne({ where: { id: ordenId } });
    if (!orden) throw new NotFoundException({ error: 'orden_no_encontrada', mensaje: 'La orden no existe.' });

    if (
      orden.estado === 'pendiente' &&
      Date.now() - new Date(orden.creadaEn).getTime() > this.timeoutMs
    ) {
      orden.estado = 'timeout';
      orden.ejecutadaEn = new Date();
      orden.mensaje = orden.mensaje ?? 'La orden excedió el tiempo máximo de espera.';
      await this.ordenesRepository.save(orden);
    }

    return this.formatoOrden(orden);
  }

  async obtenerPendientesDispositivo(dispositivo: Dispositivos) {
    const ordenes = await this.ordenesRepository.find({
      where: { dispositivoId: dispositivo.id, estado: 'pendiente' },
      order: { creadaEn: 'ASC' },
    });

    return {
      dispositivo_id: dispositivo.id,
      items: ordenes.map((orden) => ({
        id: orden.id,
        estado: orden.estado,
        creada_en: orden.creadaEn,
      })),
    };
  }

  async reportarResultado(
    ordenId: number,
    dto: ResultadoOrdenDto,
    dispositivo: Dispositivos,
  ) {
    const orden = await this.ordenesRepository.findOne({ where: { id: ordenId } });
    if (!orden) throw new NotFoundException({ error: 'orden_no_encontrada', mensaje: 'La orden no existe.' });

    if (orden.dispositivoId !== dispositivo.id) {
      throw new ConflictException({ error: 'orden_de_otro_dispositivo', mensaje: 'La orden no pertenece a este dispositivo.' });
    }

    if (orden.estado !== 'pendiente') {
      throw new UnprocessableEntityException({ error: 'orden_no_pendiente', mensaje: 'La orden ya fue procesada.' });
    }

    const ahora = new Date();
    orden.estado = dto.estado;
    orden.ejecutadaEn = ahora;
    orden.duracionS = dto.duracion_s !== undefined ? String(dto.duracion_s) : null;
    orden.mensaje = dto.mensaje ?? null;
    await this.ordenesRepository.save(orden);

    if (dto.estado === 'ejecutada') {
      const solicitante = orden.usuarioId
        ? await this.usuariosRepository.findOne({ where: { id: orden.usuarioId } })
        : null;

      await this.auditoriaService.registrar({
        usuarioId: orden.usuarioId,
        accion: 'apertura_remota',
        tablaAfectada: 'ordenes_apertura',
        registroId: String(orden.id),
        detalle: {
          tipo_evento: 'apertura_remota',
          solicitado_por: solicitante?.nombre ?? 'Usuario desconocido',
          usuario_id: orden.usuarioId,
          dispositivo_id: dispositivo.id,
          dispositivo_nombre: dispositivo.nombre,
          fecha: ahora,
          duracion_s: dto.duracion_s ?? null,
          mensaje: dto.mensaje ?? null,
        },
      });

      await this.dispositivosRepository.update(dispositivo.id, {
        ultimaConexion: ahora,
        estado: 'online',
      });
    }

    return this.formatoOrden(orden);
  }

  private formatoOrden(orden: OrdenApertura) {
    return {
      id: orden.id,
      estado: orden.estado,
      creada_en: orden.creadaEn,
      ejecutada_en: orden.ejecutadaEn,
      duracion_s: orden.duracionS === null ? null : Number(orden.duracionS),
      mensaje: orden.mensaje,
    };
  }
}
