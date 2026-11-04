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
      await this.auditoriaRepository.save({
        usuarioId: params.usuarioId ? Number(params.usuarioId) : null,
        accion: String(params.accion ?? 'EVENTO'),
        tablaAfectada: params.tablaAfectada ? String(params.tablaAfectada) : null,
        registroId: params.registroId ? String(params.registroId) : null,
        ipOrigen: params.ip ? String(params.ip) : null,
        detalle: typeof params.detalle === 'object' ? params.detalle : { detalle: params.detalle },
      });
    } catch (error) {
      this.logger.warn(`No fue posible registrar auditoría: ${String(error)}`);
    }

    return { ok: true };
  }
}
