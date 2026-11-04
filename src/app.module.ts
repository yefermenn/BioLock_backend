import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { RolesModule } from './roles/roles.module.js';
import { ZonasModule } from './zonas/zonas.module.js';
import { DispositivosModule } from './dispositivos/dispositivos.module.js';
import { HorariosModule } from './horarios/horarios.module.js';
import { AccesosModule } from './accesos/accesos.module.js';
import { IntentosFallidosModule } from './intentos-fallidos/intentos-fallidos.module.js';
import { AlarmasModule } from './alarmas/alarmas.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ReportesModule } from './reportes/reportes.module.js';
import { AuditoriaModule } from './auditoria/auditoria.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { PermisosGuard } from './common/guards/permisos.guard.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? '',
        database: process.env.DB_NAME ?? 'biolock',
        synchronize: false,
        autoLoadEntities: true,
        logging: false,
        retryAttempts: 1,
      }),
    }),
    AuthModule,
    UsuariosModule,
    RolesModule,
    ZonasModule,
    DispositivosModule,
    HorariosModule,
    AccesosModule,
    IntentosFallidosModule,
    AlarmasModule,
    DashboardModule,
    ReportesModule,
    AuditoriaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermisosGuard,
    },
  ],
})
export class AppModule {}
