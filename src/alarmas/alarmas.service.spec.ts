import { describe, expect, it, vi } from 'vitest';
import { AlarmasService } from './alarmas.service.js';

describe('AlarmasService', () => {
  it('guarda la nota de resolución en observaciones_resolucion sin tocar observaciones', async () => {
    const alarma = {
      id: 3,
      estado: 'activa',
      observaciones: 'Evento de alarma camara',
      observacionesResolucion: null,
      resueltaPor: null,
      resueltaEn: null,
      timestamp: new Date('2026-11-06T21:31:10.000Z'),
    };

    const save = vi.fn().mockImplementation(async (registro) => registro);
    const repository = {
      findOne: vi.fn().mockResolvedValue(alarma),
      save,
    };

    const service = new AlarmasService(repository as any);

    const resultado = await service.resolver(
      3,
      { estado: 'resuelta', observaciones_resolucion: 'texto', nota_resolucion: 'texto' },
      { id: 2, nombre: 'Ana' },
    );

    expect(alarma.observaciones).toBe('Evento de alarma camara');
    expect(alarma.observacionesResolucion).toBe('texto');
    expect(alarma.resueltaPor).toBe(2);
    expect(alarma.resueltaEn).toBeInstanceOf(Date);
    const fechaResuelta = alarma.resueltaEn as Date | null;
    expect(fechaResuelta).not.toBeNull();
    if (fechaResuelta) {
      expect(fechaResuelta.getTime()).toBeGreaterThanOrEqual(new Date(alarma.timestamp).getTime());
    }
    expect(save).toHaveBeenCalled();
    expect(resultado).toMatchObject({
      ok: true,
      resuelta_por: 2,
      observaciones_resolucion: 'texto',
      nota_resolucion: 'texto',
    });
  });
});
