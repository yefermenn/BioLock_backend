import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Publico } from './common/public.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Publico()
  @Get('salud')
  getHealth() {
    return this.appService.getHealth();
  }
}
