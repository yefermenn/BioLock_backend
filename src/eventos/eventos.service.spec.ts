import { describe, it, expect, vi } from 'vitest';
import { EventosService } from './eventos.service.js';

describe('EventosService', () => {
  it('guarda un acceso permitido usando el nombre si no llega usuario_id', async () => {
    const query = vi.fn().mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.dispositivos')) {
        return [{ id: 9, zona_id: 3 }];
      }
      if (sql.includes('information_schema.columns')) {
        return [];
      }
      if (sql.includes('FROM public.usuarios')) {
        return [{ id: 11 }];
      }
      if (sql.includes('INSERT INTO public.accesos')) {
        return [{ id: 22 }];
      }
      return [];
    });

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

  it('rechaza un evento remoto con usuario_id null con 422', async () => {
    const query = vi.fn().mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.dispositivos')) {
        return [{ id: 9, zona_id: 3 }];
      }
      return [];
    });
    const service = new EventosService({ query } as any);

    await expect(
      service.registrarEvento('Bearer token-device-123', {
        id_local: 'evt-002',
        tipo: 'remoto',
        origen: 'app',
        usuario_id: null,
        nombre: null,
        score: 0.5,
        ocurrido_en: '2026-11-04T09:05:00-05:00',
        tiene_foto: false,
      }),
    ).rejects.toMatchObject({
      status: 422,
      response: {
        error: 'usuario_requerido',
      },
    });
  });

  it('rechaza un evento permitido con nombre no encontrado con 422', async () => {
    const query = vi.fn().mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.dispositivos')) {
        return [{ id: 9, zona_id: 3 }];
      }
      if (sql.includes('FROM public.usuarios')) {
        return [];
      }
      return [];
    });
    const service = new EventosService({ query } as any);

    await expect(
      service.registrarEvento('Bearer token-device-123', {
        id_local: 'evt-003',
        tipo: 'permitido',
        origen: 'camara',
        usuario_id: null,
        nombre: 'usuario-inexistente',
        score: 0.7,
        ocurrido_en: '2026-11-04T09:08:00-05:00',
        tiene_foto: false,
      }),
    ).rejects.toMatchObject({
      status: 422,
      response: {
        error: 'usuario_no_encontrado',
      },
    });
  });

  it('registra una salida anónima ignorando usuario y puntaje', async () => {
    const query = vi.fn().mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.dispositivos')) {
        return [{ id: 9, zona_id: 3 }];
      }
      if (sql.includes('information_schema.columns')) {
        if (sql.includes("column_name = $2") && sql.includes('id_local')) {
          return [{ 1: 1 }];
        }
        return [];
      }
      if (sql.includes('SELECT 1') && sql.includes('FROM public.accesos')) {
        return [];
      }
      if (sql.includes('INSERT INTO public.accesos')) {
        return [{ id: 33 }];
      }
      return [];
    });

    const service = new EventosService({ query } as any);

    const result = await service.registrarEvento('Bearer token-device-123', {
      id_local: 123,
      tipo: 'salida',
      timestamp: '2026-11-23T20:10:00-05:00',
      usuario_id: 77,
      score: 0.998,
    });

    expect(result.status).toBe(201);
    expect(result.data).toMatchObject({
      tipo: 'salida',
      id_local: '123',
      usuario_id: null,
      dispositivo_id: 9,
      zona_id: 3,
      acceso_id: 33,
    });

    const insertCall = query.mock.calls.find(([sql]) =>
      sql.includes('INSERT INTO public.accesos'),
    );
    expect(insertCall?.[1]).toEqual(expect.arrayContaining([null, 9, 3, 'salida', null]));
  });
});
