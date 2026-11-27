import { Body, Controller, Delete, Get, HttpCode, Patch, Post } from '@nestjs/common';
import { UsuarioActual } from '../common/user.decorator.js';
import { DeletePushTokenDto, PushTokenDto } from './dto/push-token.dto.js';
import { UpdateNotificacionesDto } from './dto/notificaciones.dto.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('me')
export class MeController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('push-token')
  @HttpCode(204)
  registrarPushToken(@UsuarioActual() user: { id: number }, @Body() dto: PushTokenDto) {
    return this.usuariosService.upsertPushToken(user.id, dto);
  }

  @Delete('push-token')
  @HttpCode(204)
  eliminarPushToken(@UsuarioActual() user: { id: number }, @Body() dto: DeletePushTokenDto) {
    return this.usuariosService.deletePushToken(user.id, dto.token);
  }

  @Get('notificaciones')
  obtenerNotificaciones(@UsuarioActual() user: { id: number }) {
    return this.usuariosService.getNotificationPreferences(user.id);
  }

  @Patch('notificaciones')
  actualizarNotificaciones(@UsuarioActual() user: { id: number }, @Body() dto: UpdateNotificacionesDto) {
    return this.usuariosService.updateNotificationPreferences(user.id, dto);
  }
}
