import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { HorariosService } from './horarios.service.js';

describe('HorariosService', () => {
  it('rechaza horarios que se cruzan en la misma zona y día', async () => {
    const find = vi.fn().mockResolvedValue([
      { horaInicio: '08:00', horaFin: '12:00' },
    ]);
    const service = new HorariosService({ find } as any);

    await expect(
      service.create(2, {
        dia_semana: 1,
        hora_inicio: '11:00',
        hora_fin: '13:00',
        activo: true,
      }),
    ).rejects.toThrow(ConflictException);

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { zonaId: 2, diaSemana: 1, activo: true },
      }),
    );
  });
});
