import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service.js';
import { Publico } from '../common/public.decorator.js';
import { Permisos } from '../common/permissions.decorator.js';
import { UsuarioActual } from '../common/user.decorator.js';

class LoginDto {
  @IsString()
  @IsNotEmpty()
  usuario: string;

  @IsString()
  @IsNotEmpty()
  contrasena: string;
}

class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

class PasswordDto {
  @IsString()
  @IsNotEmpty()
  actual: string;

  @IsString()
  @IsNotEmpty()
  nueva: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Publico()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(
      dto.usuario,
      dto.contrasena,
      undefined,
      undefined,
    );
  }

  @Publico()
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Publico()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() body: { refresh_token?: string }) {
    await this.authService.logout(body.refresh_token ?? '');
  }

  @Get('me')
  getMe(@UsuarioActual() user: any) {
    return this.authService.me(user.id);
  }

  @Permisos('gestionar_usuarios')
  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cambiarPassword(
    @Body() dto: PasswordDto,
    @UsuarioActual() user: any,
  ) {
    await this.authService.cambiarPassword(user.id, dto.actual, dto.nueva);
  }
}
