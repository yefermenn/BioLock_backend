import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'node:crypto';
import { Repository } from 'typeorm';
import { Dispositivos } from '../../entities/entities/Dispositivos.js';

@Injectable()
export class DispositivoTokenGuard implements CanActivate {
  constructor(
    @InjectRepository(Dispositivos)
    private readonly dispositivosRepository: Repository<Dispositivos>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers?.authorization as string | undefined;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        error: 'no_autenticado',
        mensaje: 'Falta el token del dispositivo.',
      });
    }

    const token = authorization.replace('Bearer ', '').trim();
    const hash = createHash('sha256').update(token).digest('hex');
    const dispositivo = await this.dispositivosRepository.findOne({
      where: { tokenHash: hash, activo: true },
    });

    if (!dispositivo) {
      throw new UnauthorizedException({
        error: 'no_autenticado',
        mensaje: 'El token del dispositivo no es válido.',
      });
    }

    await this.dispositivosRepository.update(dispositivo.id, {
      ultimaConexion: new Date(),
      estado: 'online',
    });

    request.dispositivo = dispositivo;
    return true;
  }
}
