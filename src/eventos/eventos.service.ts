import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { DataSource } from 'typeorm';

export type EventoTipo = 'permitido' | 'denegado' | 'alarma' | 'remoto' | 'salida';

@Injectable()
export class EventosService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async registrarEvento(authorization: string | undefined, body: Record<string, unknown>) {
    const tipo = this.normalizarTipo(body.tipo);
    const idLocal = this.normalizarIdLocal(body.id_local ?? body.idLocal);
    const score = this.normalizarScore(body.score);
    const timestamp = this.normalizarFecha(body.ocurrido_en ?? body.ocurridoEn ?? new Date());

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        error: 'no_autenticado',
        mensaje: 'Falta el token del dispositivo en el header Authorization.',
      });
    }

    if (!tipo) {
      throw new BadRequestException({
        error: 'tipo_invalido',
        mensaje: 'El campo tipo debe ser permitido, denegado, alarma, remoto o salida.',
      });
    }

    if (!idLocal) {
      throw new BadRequestException({
        error: 'id_local_invalido',
        mensaje: 'El campo id_local es obligatorio.',
      });
    }

    const token = authorization.replace('Bearer ', '').trim();
    const dispositivo = await this.obtenerDispositivoPorToken(token);
    const dispositivoId = Number(dispositivo.id);
    const zonaId = Number(dispositivo.zona_id ?? dispositivo.zonaId ?? 0);

    if (!Number.isFinite(dispositivoId) || dispositivoId <= 0 || !Number.isFinite(zonaId) || zonaId <= 0) {
      throw new UnauthorizedException({
        error: 'dispositivo_invalido',
        mensaje: 'El token del dispositivo no tiene una zona asociada.',
      });
    }

    await this.validarDuplicados({
      dispositivoId,
      idLocal,
      tipo,
      timestamp,
    });

    const usuarioId = await this.resolverUsuarioId(tipo, body.usuario_id ?? body.usuarioId, body.nombre);

    if ((tipo === 'permitido' || tipo === 'remoto') && !usuarioId) {
      if (tipo === 'remoto') {
        throw new UnprocessableEntityException({
          error: 'usuario_requerido',
          mensaje: 'Los eventos remotos requieren usuario_id válido; la API no puede inferir el usuario sin la orden asociada.',
        });
      }

      const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
      throw new UnprocessableEntityException({
        error: 'usuario_no_encontrado',
        mensaje: nombre
          ? `No existe un usuario con el nombre "${nombre}" para un acceso permitido.`
          : 'Falta usuario_id o nombre válido para registrar un acceso permitido.',
      });
    }

    switch (tipo) {
      case 'permitido': {
        const accesoId = await this.insertarAcceso({
          dispositivoId,
          zonaId,
          usuarioId,
          tipoAcceso: 'presencial',
          score,
          idLocal,
          origen: String(body.origen ?? 'camara'),
          timestamp,
        });

        return {
          status: 201,
          mensaje: 'Evento registrado',
          data: {
            tipo,
            id_local: idLocal,
            usuario_id: usuarioId,
            dispositivo_id: dispositivoId,
            zona_id: zonaId,
            acceso_id: accesoId,
          },
        };
      }
      case 'remoto': {
        const accesoId = await this.insertarAcceso({
          dispositivoId,
          zonaId,
          usuarioId,
          tipoAcceso: 'remoto',
          score,
          idLocal,
          origen: String(body.origen ?? 'camara'),
          timestamp,
        });

        return {
          status: 201,
          mensaje: 'Evento registrado',
          data: {
            tipo,
            id_local: idLocal,
            usuario_id: usuarioId,
            dispositivo_id: dispositivoId,
            zona_id: zonaId,
            acceso_id: accesoId,
          },
        };
      }
      case 'salida': {
        const accesoId = await this.insertarAcceso({
          dispositivoId,
          zonaId,
          usuarioId: usuarioId ?? null,
          tipoAcceso: 'salida',
          score: null,
          idLocal,
          origen: String(body.origen ?? 'camara'),
          timestamp,
        });

        return {
          status: 201,
          mensaje: 'Salida registrada',
          data: {
            tipo,
            id_local: idLocal,
            usuario_id: usuarioId,
            dispositivo_id: dispositivoId,
            zona_id: zonaId,
            acceso_id: accesoId,
          },
        };
      }
      case 'denegado': {
        const intentoId = await this.insertarIntentoFallido({
          dispositivoId,
          zonaId,
          usuarioId: null,
          score,
          motivo: 'denegado',
          idLocal,
          timestamp,
        });

        return {
          status: 201,
          mensaje: 'Intento fallido registrado',
          data: {
            tipo,
            id_local: idLocal,
            usuario_id: null,
            dispositivo_id: dispositivoId,
            zona_id: zonaId,
            intento_id: intentoId,
          },
        };
      }
      case 'alarma': {
        const alarmaId = await this.insertarAlarma({
          dispositivoId,
          zonaId,
          observaciones: `Evento de alarma ${String(body.origen ?? 'camara')}`,
          timestamp,
        });

        await this.vincularUltimoIntentoFallidoConAlarma(dispositivoId, alarmaId, timestamp);

        return {
          status: 201,
          mensaje: 'Alarma registrada',
          data: {
            tipo,
            id_local: idLocal,
            dispositivo_id: dispositivoId,
            zona_id: zonaId,
            alarma_id: alarmaId,
          },
        };
      }
      default:
        throw new BadRequestException({
          error: 'tipo_invalido',
          mensaje: 'Tipo de evento no soportado.',
        });
    }
  }

  private async obtenerDispositivoPorToken(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const rows = await this.dataSource.query(
      `SELECT d.id, dz.zona_id
       FROM public.dispositivos d
       LEFT JOIN public.dispositivos_zonas dz ON dz.dispositivo_id = d.id AND dz.activo = true
       WHERE d.token_hash = $1
       ORDER BY dz.instalado_en DESC NULLS LAST
       LIMIT 1`,
      [tokenHash],
    );

    if (!rows || rows.length === 0) {
      throw new UnauthorizedException({
        error: 'no_autenticado',
        mensaje: 'El token del dispositivo no es válido o no está asociado a un dispositivo activo.',
      });
    }

    return rows[0];
  }

  private async resolverUsuarioId(
    tipo: EventoTipo,
    usuarioIdBody: unknown,
    nombreBody: unknown,
  ): Promise<number | null> {
    const providedId = this.normalizarEntero(usuarioIdBody);
    if (providedId && providedId > 0) {
      return providedId;
    }

    if (tipo === 'permitido' && typeof nombreBody === 'string' && nombreBody.trim()) {
      const nombre = nombreBody.trim();
      const rows = await this.dataSource.query(
        `SELECT id
         FROM public.usuarios
         WHERE LOWER(TRIM(nombre)) = LOWER(TRIM($1))
         LIMIT 1`,
        [nombre],
      );

      return rows && rows[0] ? Number(rows[0].id) : null;
    }

    return null;
  }

  private async validarDuplicados(args: {
    dispositivoId: number;
    idLocal: string;
    tipo: EventoTipo;
    timestamp: Date;
  }) {
    const { dispositivoId, idLocal, tipo, timestamp } = args;

    if (tipo === 'permitido' || tipo === 'remoto' || tipo === 'salida') {
      const existeEnAccesos = await this.existeRegistroDuplicado('accesos', {
        dispositivoId,
        idLocal,
      });
      if (existeEnAccesos) {
        throw new ConflictException({
          error: 'evento_duplicado',
          mensaje: 'Ya existe un acceso para este dispositivo y id_local.',
        });
      }
    }

    if (tipo === 'denegado') {
      const existeEnFallidos = await this.existeRegistroDuplicado('intentos_fallidos', {
        dispositivoId,
        idLocal,
      });
      if (existeEnFallidos) {
        throw new ConflictException({
          error: 'evento_duplicado',
          mensaje: 'Ya existe un intento fallido para este dispositivo y id_local.',
        });
      }
    }

    if (tipo === 'alarma') {
      const rows = await this.dataSource.query(
        `SELECT 1
         FROM public.alarmas
         WHERE dispositivo_id = $1
           AND timestamp = $2
         LIMIT 1`,
        [dispositivoId, timestamp],
      );

      if (rows && rows.length > 0) {
        throw new ConflictException({
          error: 'evento_duplicado',
          mensaje: 'Ya existe una alarma para este dispositivo en la misma fecha exacta.',
        });
      }
    }
  }

  private async existeRegistroDuplicado(
    tabla: 'accesos' | 'intentos_fallidos',
    datos: {
      dispositivoId: number;
      idLocal: string;
    },
  ): Promise<boolean> {
    const tieneIdLocal = await this.columnaExiste(tabla, 'id_local');
    if (!tieneIdLocal) {
      return false;
    }

    const rows = await this.dataSource.query(
      `SELECT 1
       FROM public.${tabla}
       WHERE dispositivo_id = $1
         AND id_local = $2
       LIMIT 1`,
      [datos.dispositivoId, datos.idLocal],
    );

    return Boolean(rows && rows.length > 0);
  }

  private async columnaExiste(tabla: string, columna: string): Promise<boolean> {
    const rows = await this.dataSource.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = $1
         AND column_name = $2
       LIMIT 1`,
      [tabla, columna],
    );

    return Boolean(rows && rows.length > 0);
  }

  private async insertarAcceso(args: {
    dispositivoId: number;
    zonaId: number;
    usuarioId: number | null;
    tipoAcceso: 'presencial' | 'remoto' | 'salida';
    score: number | null;
    origen: string;
    idLocal: string;
    timestamp: Date;
  }) {
    const { dispositivoId, zonaId, usuarioId, tipoAcceso, score, origen, idLocal, timestamp } = args;
    const insertColumns = ['usuario_id', 'dispositivo_id', 'zona_id', 'tipo_acceso', 'score_biometrico', 'timestamp'];
    const values: unknown[] = [usuarioId, dispositivoId, zonaId, tipoAcceso, score, timestamp];

    if (await this.columnaExiste('accesos', 'id_local')) {
      insertColumns.push('id_local');
      values.push(idLocal);
    }

    if (await this.columnaExiste('accesos', 'origen')) {
      insertColumns.push('origen');
      values.push(origen);
    }

    const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
    const result = await this.dataSource.query(
      `INSERT INTO public.accesos (${insertColumns.join(', ')}) VALUES (${placeholders}) RETURNING id`,
      values,
    );

    return Number(result?.[0]?.id ?? 0);
  }

  private async insertarIntentoFallido(args: {
    dispositivoId: number;
    zonaId: number;
    usuarioId: number | null;
    score: number | null;
    motivo: string;
    idLocal: string;
    timestamp: Date;
  }) {
    const { dispositivoId, zonaId, usuarioId, score, motivo, idLocal, timestamp } = args;
    const insertColumns = ['dispositivo_id', 'zona_id', 'usuario_id', 'score_obtenido', 'motivo', 'timestamp'];
    const values: unknown[] = [dispositivoId, zonaId, usuarioId, score, motivo, timestamp];

    if (await this.columnaExiste('intentos_fallidos', 'id_local')) {
      insertColumns.push('id_local');
      values.push(idLocal);
    }

    if (await this.columnaExiste('intentos_fallidos', 'foto_ruta')) {
      insertColumns.push('foto_ruta');
      values.push(null);
    }

    const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
    const result = await this.dataSource.query(
      `INSERT INTO public.intentos_fallidos (${insertColumns.join(', ')}) VALUES (${placeholders}) RETURNING id`,
      values,
    );

    return Number(result?.[0]?.id ?? 0);
  }

  private async insertarAlarma(args: {
    dispositivoId: number;
    zonaId: number;
    observaciones: string;
    timestamp: Date;
  }) {
    const { dispositivoId, zonaId, observaciones, timestamp } = args;
    const insertColumns = ['dispositivo_id', 'zona_id', 'estado', 'timestamp'];
    const values: unknown[] = [dispositivoId, zonaId, 'activa', timestamp];

    if (await this.columnaExiste('alarmas', 'observaciones')) {
      insertColumns.push('observaciones');
      values.push(observaciones);
    }

    const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
    const result = await this.dataSource.query(
      `INSERT INTO public.alarmas (${insertColumns.join(', ')}) VALUES (${placeholders}) RETURNING id`,
      values,
    );

    return Number(result?.[0]?.id ?? 0);
  }

  private async vincularUltimoIntentoFallidoConAlarma(
    dispositivoId: number,
    alarmaId: number,
    timestamp: Date,
  ) {
    const rows = await this.dataSource.query(
      `SELECT id
       FROM public.intentos_fallidos
       WHERE dispositivo_id = $1
         AND timestamp <= $2
       ORDER BY timestamp DESC
       LIMIT 1`,
      [dispositivoId, timestamp],
    );

    if (rows && rows.length > 0) {
      await this.dataSource.query(
        `UPDATE public.intentos_fallidos
         SET alarma_id = $1
         WHERE id = $2`,
        [alarmaId, Number(rows[0].id)],
      );
    }
  }

  private async resolverTipoAcceso(tipoEvento: 'permitido' | 'salida'): Promise<'entrada' | 'salida'> {
    const valoresPermitidos = await this.obtenerValoresCheck('public.accesos', 'tipo_acceso');

    if (tipoEvento === 'salida') {
      const preferidos = ['salida', 's', 'egreso'];
      const valor = preferidos.find((item) => valoresPermitidos.includes(item));
      return (valor ?? valoresPermitidos[0] ?? 'salida') as 'entrada' | 'salida';
    }

    const preferidos = ['entrada', 'permitido', 'biometrico', 'manual', 'remota'];
    const valor = preferidos.find((item) => valoresPermitidos.includes(item));
    return (valor ?? valoresPermitidos[0] ?? 'entrada') as 'entrada' | 'salida';
  }

  private async obtenerValoresCheck(tabla: string, columna: string): Promise<string[]> {
    const rows = await this.dataSource.query(
      `SELECT pg_get_constraintdef(oid) AS definicion
       FROM pg_constraint
       WHERE conrelid = $1::regclass
         AND conname LIKE $2
       LIMIT 1`,
      [tabla, `%${columna}%`],
    );

    const definicion = String(rows?.[0]?.definicion ?? '');
    const matches = Array.from(definicion.matchAll(/'([^']+)'/g), (match) => match[1]);
    return matches.map((valor) => valor.trim().toLowerCase());
  }

  private normalizarTipo(tipo: unknown): EventoTipo | null {
    if (typeof tipo !== 'string') {
      return null;
    }

    const value = tipo.trim().toLowerCase();
    const mapped = value === 'alerta' ? 'alarma' : value;
    if (['permitido', 'denegado', 'alarma', 'remoto', 'salida'].includes(mapped)) {
      return mapped as EventoTipo;
    }

    return null;
  }

  private normalizarIdLocal(value: unknown): string | null {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    return null;
  }

  private normalizarScore(value: unknown): number | null {
    const parsed = this.normalizarEntero(value);
    if (parsed !== null) {
      return parsed;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) {
        return numeric;
      }
    }

    return null;
  }

  private normalizarEntero(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return null;
  }

  private normalizarFecha(value: unknown): Date {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return new Date();
  }
}
