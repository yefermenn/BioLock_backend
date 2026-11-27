import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class NotificacionesPushService {
  private readonly logger = new Logger(NotificacionesPushService.name);
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async enviar(tipo: 'alarma' | 'denegado', alertaId: number, zona: string, intentos: number) {
    const preferencia = tipo === 'alarma' ? 'u.notif_intrusos' : 'u.notif_denegados';
    const filas = await this.dataSource.query(
      `SELECT DISTINCT pt.token
       FROM public.push_tokens pt
       JOIN public.usuarios u ON u.id = pt.usuario_id
       JOIN public.usuarios_roles ur ON ur.usuario_id = u.id
       JOIN public.roles r ON r.id = ur.rol_id
       WHERE u.activo = true AND u.notif_push = true AND ${preferencia} = true
         AND r.activo = true AND r.nombre IN ('administrador','superadmin')`,
    );

    const tokens: string[] = (filas ?? []).map((fila: { token: string }) => fila.token);
    for (const token of tokens) {
      const payload = {
        to: token,
        title: 'Alerta de BioLock',
        body: `Rostro desconocido en ${zona} · ${intentos} intentos`,
        data: { tipo, alerta_id: alertaId },
      };
      try {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        this.logger.error(`Expo push falló para usuario: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}
