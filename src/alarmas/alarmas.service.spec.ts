import { describe, expect, it, vi } from 'vitest';
import { AlarmasService } from './alarmas.service.js';

describe('AlarmasService', () => {
  it('guarda la nota de resolución en observaciones_resolucion sin tocar observaciones', async () => {
    const alarma = {
      id: 1,
      estado: 'activa',
      observaciones: 'Reporte original',
      observacionesResolucion: null,
      resueltaPor: null,
      resueltaEn: null,
      timestamp: new Date(),
    };

    const save = vi.fn().mockImplementation(async (registro) => registro);
    const repository = {
      findOne: vi.fn().mockResolvedValue(alarma),
      save,
    };

    const service = new AlarmasService(repository as any);

    const resultado = await service.resolver(
      1,
      { estado: 'resuelta', nota: 'Se resolvió por revisión del equipo.' },
      { id: 42, nombre: 'Ana' },
    );

    expect(alarma.observaciones).toBe('Reporte original');
    expect(alarma.observacionesResolucion).toBe('Se resolvió por revisión del equipo.');
    expect(alarma.resueltaPor).toBe(42);
    expect(alarma.resueltaEn).toBeInstanceOf(Date);
    expect(save).toHaveBeenCalled();
    expect(resultado).toMatchObject({
      ok: true,
      resuelta_por: 42,
      observaciones_resolucion: 'Se resolvió por revisión del equipo.',
    });
  });
});
