import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { Publico } from '../common/public.decorator.js';
import { EventosService } from './eventos.service.js';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Publico()
  @Post()
  @HttpCode(201)
  async create(@Headers('authorization') authorization: string | undefined, @Body() body: Record<string, unknown>) {
    return this.eventosService.registrarEvento(authorization, body);
  }
}
