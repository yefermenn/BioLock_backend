import { describe, expect, it, vi } from 'vitest';
import { AccesosService } from './accesos.service.js';

describe('AccesosService', () => {
  it('aplica paginación y filtros por rango de fechas', async () => {
    const findAndCount = vi.fn().mockResolvedValue([[], 0]);
    const service = new AccesosService({ findAndCount } as any);

    await service.list({
      pagina: 2,
      limite: 10,
      desde: '2026-11-01T00:00:00-05:00',
      hasta: '2026-11-05T23:59:59-05:00',
    });

    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          timestamp: expect.any(Object),
        }),
        order: { timestamp: 'DESC' },
        skip: 10,
        take: 10,
      }),
    );
  });
});
