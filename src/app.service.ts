import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      ok: true,
      servicio: 'BioLock backend',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
