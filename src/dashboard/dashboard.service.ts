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
      ultimos_eventos: [],
    };
  }

  async tendencia(dias = 7) {
    const rows = await this.dataSource.query(
      `SELECT
         to_char(timestamp AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD') AS fecha,
         COUNT(*) FILTER (WHERE tipo_acceso IS NOT NULL) AS accesos,
         COUNT(*) FILTER (WHERE 1=0) AS intentos_fallidos,
         COUNT(*) FILTER (WHERE 1=0) AS alarmas
       FROM public.accesos
       WHERE timestamp >= now() - ($1 || ' days')::interval
       GROUP BY 1
       ORDER BY 1 DESC`,
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
