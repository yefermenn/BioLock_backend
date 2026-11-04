import { describe, it, expect, vi } from 'vitest';
import { EventosService } from './eventos.service.js';

describe('EventosService', () => {
  it('guarda un acceso permitido usando el nombre si no llega usuario_id', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce([{ id: 9, zona_id: 3 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 11 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 22 }]);

    const service = new EventosService({ query } as any);

    const result = await service.registrarEvento('Bearer token-device-123', {
      id_local: 'evt-001',
      tipo: 'permitido',
      origen: 'camara',
      usuario_id: null,
      nombre: 'Ana López',
      score: 0.9912,
      ocurrido_en: '2026-11-04T09:00:00-05:00',
      tiene_foto: false,
    });

    expect(result.status).toBe(201);
    expect(result.data.tipo).toBe('permitido');
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.accesos'),
      expect.any(Array),
    );
  });
});
