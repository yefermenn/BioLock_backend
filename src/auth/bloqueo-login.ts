import { Injectable } from '@nestjs/common';

/** Intentos fallidos seguidos antes de bloquear. */
export const MAXIMO_INTENTOS = 5;
/** Duración del bloqueo. */
export const BLOQUEO_MS = 5 * 60_000;
/** Si pasa este tiempo sin fallar, el conteo vuelve a cero. */
export const VENTANA_MS = 15 * 60_000;

interface Estado {
  fallidos: number;
  ultimoFallo: number;
  hasta: number;
}

/**
 * SESION (25 nov): bloqueo de POST /auth/login tras 5 intentos fallidos seguidos, por 5 minutos.
 * Se cuenta por usuario (correo o cédula), en memoria: alcanza para una sola instancia de la API
 * y no cambia tablas. Si la API se reinicia, los contadores empiezan de cero.
 */
@Injectable()
export class BloqueoLogin {
  private readonly estados = new Map<string, Estado>();

  static clave(usuario: string): string {
    return (usuario ?? '').trim().toLowerCase();
  }

  /** Segundos que faltan de bloqueo (0 si puede intentar). */
  segundosRestantes(clave: string, ahora = Date.now()): number {
    this.limpiar(ahora);
    const e = this.estados.get(clave);
    return e && e.hasta > ahora ? Math.ceil((e.hasta - ahora) / 1000) : 0;
  }

  /** Registra un fallo. Devuelve los segundos de bloqueo si con este se bloqueó (0 si no). */
  fallo(clave: string, ahora = Date.now()): number {
    const previo = this.estados.get(clave);
    const fallidos = previo && ahora - previo.ultimoFallo < VENTANA_MS ? previo.fallidos + 1 : 1;
    const hasta = fallidos >= MAXIMO_INTENTOS ? ahora + BLOQUEO_MS : 0;
    // Al bloquear, el conteo vuelve a cero: tras el bloqueo hay otros 5 intentos.
    this.estados.set(clave, { fallidos: hasta ? 0 : fallidos, ultimoFallo: ahora, hasta });
    return hasta ? Math.ceil(BLOQUEO_MS / 1000) : 0;
  }

  exito(clave: string): void {
    this.estados.delete(clave);
  }

  private limpiar(ahora: number): void {
    for (const [clave, e] of this.estados) {
      if (e.hasta <= ahora && ahora - e.ultimoFallo >= VENTANA_MS) this.estados.delete(clave);
    }
  }
}
