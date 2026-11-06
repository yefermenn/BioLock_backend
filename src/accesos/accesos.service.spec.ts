import { describe, expect, it, vi } from 'vitest';
import { AccesosService } from './accesos.service.js';

describe('AccesosService', () => {
  it('aplica paginación, filtros por rango de fechas y filtros por entidad', async () => {
    const findAndCount = vi.fn().mockResolvedValue([[], 0]);
    const service = new AccesosService({ findAndCount } as any);

    await service.list({
      pagina: 2,
      limite: 10,
      usuario_id: 7,
      zona_id: 3,
      dispositivo_id: 9,
      tipo_acceso: 'presencial',
      desde: '2026-11-01T00:00:00-05:00',
      hasta: '2026-11-05T23:59:59-05:00',
    });

    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          usuarioId: 7,
          zonaId: 3,
          dispositivoId: 9,
          tipoAcceso: 'presencial',
          timestamp: expect.any(Object),
        }),
        order: { timestamp: 'DESC' },
        skip: 10,
        take: 10,
      }),
    );
  });
});
