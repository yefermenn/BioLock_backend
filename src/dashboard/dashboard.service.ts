import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async resumen() {
    const accesoHoy = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM public.accesos WHERE timestamp >= date_trunc('day', now())`,
    );
    const salidasHoy = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM public.accesos WHERE tipo_acceso = 'salida' AND timestamp >= date_trunc('day', now())`,
    );
    const intentosHoy = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM public.intentos_fallidos WHERE timestamp >= date_trunc('day', now())`,
    );
    const alarmasActivas = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM public.alarmas WHERE estado = 'activa'`,
    );
    const usuariosActivos = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM public.usuarios WHERE activo = true`,
    );
    const usuariosSinBiometria = await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM public.usuarios WHERE activo = true AND biometria_registrada = false`,
    );
    const dispositivos = await this.dataSource.query(
      `SELECT id, nombre, ultima_conexion, activo, estado, now() - ultima_conexion < interval '2 minutes' AS en_linea
       FROM public.dispositivos ORDER BY id ASC`,
    );
    const ultimosEventos = await this.dataSource.query(
      `SELECT fecha, tipo, descripcion
       FROM (
         SELECT timestamp AS fecha, 'acceso' AS tipo, COALESCE(u.nombre, 'Sistema') || ' entró al sitio' AS descripcion
         FROM public.accesos a
         LEFT JOIN public.usuarios u ON u.id = a.usuario_id
         ORDER BY a.timestamp DESC
         LIMIT 5
       ) q
       UNION ALL
       SELECT fecha, tipo, descripcion
       FROM (
         SELECT timestamp AS fecha, 'intento_fallido' AS tipo, 'Intento fallido en dispositivo' AS descripcion
         FROM public.intentos_fallidos
         ORDER BY timestamp DESC
         LIMIT 5
       ) q2
       ORDER BY fecha DESC
       LIMIT 10`,
    );

    return {
      fecha: new Date().toISOString().slice(0, 10),
      accesos_hoy: Number(accesoHoy[0]?.total ?? 0),
      salidas_hoy: Number(salidasHoy[0]?.total ?? 0),
      intentos_fallidos_hoy: Number(intentosHoy[0]?.total ?? 0),
      alarmas_activas: Number(alarmasActivas[0]?.total ?? 0),
      usuarios_activos: Number(usuariosActivos[0]?.total ?? 0),
      usuarios_sin_biometria: Number(usuariosSinBiometria[0]?.total ?? 0),
      dispositivos: (dispositivos as any[]).map((item: any) => ({
        id: item.id,
        nombre: item.nombre,
        en_linea: item.en_linea,
        ultima_conexion: item.ultima_conexion,
      })),
      accesos_por_hora: [],
      ultimos_eventos: (ultimosEventos as any[]).map((item: any) => ({
        fecha: item.fecha,
        tipo: item.tipo,
        descripcion: item.descripcion,
      })),
    };
  }

  async tendencia(dias = 7) {
    const rows = await this.dataSource.query(
      `WITH rango AS (
         SELECT generate_series(
           date_trunc('day', now() - ($1 || ' days')::interval),
           date_trunc('day', now()),
           interval '1 day'
         )::date AS fecha
       )
       SELECT
         to_char(r.fecha AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD') AS fecha,
         COALESCE((SELECT COUNT(*)::int FROM public.accesos a WHERE a.timestamp::date = r.fecha), 0) AS accesos,
         COALESCE((SELECT COUNT(*)::int FROM public.intentos_fallidos i WHERE i.timestamp::date = r.fecha), 0) AS intentos_fallidos,
         COALESCE((SELECT COUNT(*)::int FROM public.alarmas al WHERE al.timestamp::date = r.fecha), 0) AS alarmas
       FROM rango r
       ORDER BY r.fecha DESC`,
      [Number(dias)],
    );

    return rows.map((row: any) => ({
      fecha: row.fecha,
      accesos: Number(row.accesos ?? 0),
      intentos_fallidos: Number(row.intentos_fallidos ?? 0),
      alarmas: Number(row.alarmas ?? 0),
    }));
  }
}
