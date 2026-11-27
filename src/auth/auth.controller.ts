import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthService, Cliente } from './auth.service.js';
import { BloqueoLogin } from './bloqueo-login.js';
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
  constructor(
    private readonly authService: AuthService,
    private readonly bloqueo: BloqueoLogin,
  ) {}

  private cliente(cabecera?: string): Cliente {
    return cabecera?.toLowerCase() === 'panel' ? 'panel' : 'otro';
  }

  @Publico()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Headers('x-cliente') cabecera: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    // SESION (25 nov): 5 intentos fallidos seguidos bloquean 5 minutos (429 + Retry-After).
    const clave = BloqueoLogin.clave(dto.usuario);
    const espera = this.bloqueo.segundosRestantes(clave);
    if (espera) this.demasiadosIntentos(res, espera);
    try {
      const resultado = await this.authService.login(dto.usuario, dto.contrasena, undefined, undefined, this.cliente(cabecera));
      this.bloqueo.exito(clave);
      return resultado;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        const bloqueo = this.bloqueo.fallo(clave);
        if (bloqueo) this.demasiadosIntentos(res, bloqueo);
      }
      throw err;
    }
  }

  private demasiadosIntentos(res: Response, segundos: number): never {
    res.setHeader('Retry-After', String(segundos));
    throw new HttpException(
      {
        error: 'demasiados_intentos',
        mensaje: 'Demasiados intentos fallidos. Intenta de nuevo en unos minutos.',
        reintentar_en_seg: segundos,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  @Publico()
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto, @Headers('x-cliente') cabecera: string | undefined) {
    return this.authService.refresh(dto.refresh_token, undefined, undefined, this.cliente(cabecera));
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
