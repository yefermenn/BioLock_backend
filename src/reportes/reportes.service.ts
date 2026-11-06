import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportesService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  catalogo() {
    return [
      { clave: 'accesos-por-zona', titulo: 'Accesos por zona', descripcion: 'Total por zona', filtros: ['desde', 'hasta', 'zona_id'] },
      { clave: 'accesos-por-usuario', titulo: 'Accesos por usuario', descripcion: 'Top de usuarios', filtros: ['desde', 'hasta'] },
      { clave: 'accesos-por-dia', titulo: 'Accesos por día', descripcion: 'Tendencia por fecha', filtros: ['desde', 'hasta'] },
      { clave: 'intentos-por-dispositivo', titulo: 'Intentos por dispositivo', descripcion: 'Denegados por equipo', filtros: ['desde', 'hasta'] },
      { clave: 'usuarios-sin-biometria', titulo: 'Usuarios sin biometría', descripcion: 'Cobertura de enrollment', filtros: [] },
      { clave: 'ocupacion', titulo: 'Ocupación', descripcion: 'Uso por zona', filtros: ['desde', 'hasta'] },
    ];
  }

  async ejecutar(clave: string) {
    if (clave === 'accesos-por-zona') {
      const rows = await this.dataSource.query(
        `SELECT z.nombre AS zona, COUNT(a.id)::int AS total
         FROM public.accesos a
         JOIN public.zonas z ON z.id = a.zona_id
         GROUP BY z.nombre
         ORDER BY total DESC`,
      );
      return { clave, columnas: ['zona', 'total'], filas: rows };
    }

    if (clave === 'accesos-por-usuario') {
      const rows = await this.dataSource.query(
        `SELECT u.nombre AS usuario, COUNT(a.id)::int AS total
         FROM public.accesos a
         LEFT JOIN public.usuarios u ON u.id = a.usuario_id
         GROUP BY u.nombre
         ORDER BY total DESC`,
      );
      return { clave, columnas: ['usuario', 'total'], filas: rows };
    }

    if (clave === 'accesos-por-dia') {
      const rows = await this.dataSource.query(
        `SELECT to_char(timestamp AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD') AS fecha, COUNT(*)::int AS total
         FROM public.accesos
         GROUP BY 1
         ORDER BY 1 DESC`,
      );
      return { clave, columnas: ['fecha', 'total'], filas: rows };
    }

    if (clave === 'intentos-por-dispositivo') {
      const rows = await this.dataSource.query(
        `SELECT d.nombre AS dispositivo, COUNT(i.id)::int AS total
         FROM public.intentos_fallidos i
         LEFT JOIN public.dispositivos d ON d.id = i.dispositivo_id
         GROUP BY d.nombre
         ORDER BY total DESC`,
      );
      return { clave, columnas: ['dispositivo', 'total'], filas: rows };
    }

    if (clave === 'usuarios-sin-biometria') {
      const rows = await this.dataSource.query(
        `SELECT u.nombre AS usuario, u.cedula, u.correo
         FROM public.usuarios u
         WHERE u.activo = TRUE AND u.biometria_registrada = FALSE
         ORDER BY u.nombre ASC`,
      );
      return { clave, columnas: ['usuario', 'cedula', 'correo'], filas: rows };
    }

    if (clave === 'ocupacion') {
      const rows = await this.dataSource.query(
        `SELECT z.nombre AS zona, COUNT(a.id)::int AS total
         FROM public.accesos a
         RIGHT JOIN public.zonas z ON z.id = a.zona_id
         GROUP BY z.nombre
         ORDER BY total DESC`,
      );
      return { clave, columnas: ['zona', 'total'], filas: rows };
    }

    return { clave, columnas: [], filas: [] };
  }
}
