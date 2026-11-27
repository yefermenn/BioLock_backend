import { describe, expect, it } from 'vitest';
import { BLOQUEO_MS, BloqueoLogin, MAXIMO_INTENTOS, VENTANA_MS } from './bloqueo-login.js';

describe('BloqueoLogin', () => {
  const t0 = 1_000_000;

  it('bloquea al quinto fallo seguido y por 5 minutos', () => {
    const b = new BloqueoLogin();
    for (let i = 1; i < MAXIMO_INTENTOS; i++) expect(b.fallo('ana@x.co', t0 + i)).toBe(0);
    expect(b.fallo('ana@x.co', t0 + 10)).toBe(BLOQUEO_MS / 1000);
    expect(b.segundosRestantes('ana@x.co', t0 + 11)).toBe(300);
    expect(b.segundosRestantes('ana@x.co', t0 + 10 + BLOQUEO_MS)).toBe(0);
  });

  it('un acceso correcto reinicia el conteo', () => {
    const b = new BloqueoLogin();
    for (let i = 0; i < 4; i++) b.fallo('ana@x.co', t0 + i);
    b.exito('ana@x.co');
    expect(b.fallo('ana@x.co', t0 + 10)).toBe(0);
  });

  it('los fallos viejos (fuera de la ventana) no cuentan', () => {
    const b = new BloqueoLogin();
    for (let i = 0; i < 4; i++) b.fallo('ana@x.co', t0 + i);
    expect(b.fallo('ana@x.co', t0 + VENTANA_MS + 10)).toBe(0);
  });

  it('cada usuario tiene su propio conteo', () => {
    const b = new BloqueoLogin();
    for (let i = 0; i < 5; i++) b.fallo('ana@x.co', t0 + i);
    expect(b.segundosRestantes('beto@x.co', t0 + 6)).toBe(0);
  });

  it('la clave ignora mayúsculas y espacios', () => {
    expect(BloqueoLogin.clave('  Ana@X.co ')).toBe('ana@x.co');
  });
});
