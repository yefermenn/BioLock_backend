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

    return { clave, columnas: [], filas: [] };
  }
}
