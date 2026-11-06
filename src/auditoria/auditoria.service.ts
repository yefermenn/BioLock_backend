import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogsAuditoria } from '../entities/entities/LogsAuditoria.js';

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(
    @InjectRepository(LogsAuditoria)
    private readonly auditoriaRepository: Repository<LogsAuditoria>,
  ) {}

  async registrar(params: Record<string, unknown>) {
    try {
      await this.auditoriaRepository.insert({
        usuarioId: params.usuarioId !== undefined && params.usuarioId !== null ? Number(params.usuarioId) : null,
        accion: String(params.accion ?? 'EVENTO'),
        tablaAfectada: params.tablaAfectada ? String(params.tablaAfectada) : null,
        registroId: params.registroId !== undefined && params.registroId !== null ? String(params.registroId) : null,
        ipOrigen: params.ip ? String(params.ip) : null,
        detalle: typeof params.detalle === 'object' && params.detalle !== null ? params.detalle as object : { detalle: params.detalle },
      });
    } catch (error) {
      this.logger.warn(`No fue posible registrar auditoría: ${String(error)}`);
    }

    return { ok: true };
  }

  async list(filters: { usuarioId?: number; accion?: string; tabla?: string } = {}) {
    const where: Record<string, any> = {};

    if (filters.usuarioId) where.usuarioId = filters.usuarioId;
    if (filters.accion) where.accion = filters.accion;
    if (filters.tabla) where.tablaAfectada = filters.tabla;

    const [rows, total] = await this.auditoriaRepository.findAndCount({
      where,
      relations: { usuario: true },
      order: { timestamp: 'DESC' },
      take: 20,
    });

    return {
      items: rows.map((row) => ({
        id: row.id,
        fecha: row.timestamp,
        usuario: row.usuario ? { id: row.usuario.id, nombre: row.usuario.nombre } : null,
        accion: row.accion,
        tabla_afectada: row.tablaAfectada,
        registro_id: row.registroId,
        ip_origen: row.ipOrigen,
        detalle: row.detalle,
      })),
      total,
    };
  }
}
