import 'dotenv/config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const traducir = (mensaje: string) => {
          const texto = String(mensaje)
            .replace(/should not be empty/gi, 'no puede estar vacío')
            .replace(/should be a valid/gi, 'debe ser un valor válido')
            .replace(/must be a string/gi, 'debe ser texto')
            .replace(/must be a number/gi, 'debe ser numérico')
            .replace(/must be a boolean/gi, 'debe ser booleano')
            .replace(/must be an instance of/gi, 'debe ser una instancia de')
            .replace(/must be a valid UUID/gi, 'debe ser un UUID válido')
            .replace(/must be longer than or equal to/gi, 'debe tener longitud mayor o igual a')
            .replace(/must be shorter than or equal to/gi, 'debe tener longitud menor o igual a');

          const coincidencia = texto.match(/^([A-Za-z0-9_]+)\s+(.*)$/);
          if (coincidencia) {
            const campo = coincidencia[1].replace(/_/g, ' ');
            return `${campo} ${coincidencia[2]}`;
          }

          return texto;
        };

        const message = errors
          .map((error) => Object.values(error.constraints ?? {}).map(traducir))
          .flat()
          .filter(Boolean)
          .join('; ');

        return new BadRequestException({
          error: 'validacion',
          mensaje: message || 'Los datos enviados no son válidos.',
        });
      },
    }),
  );
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  await app.listen(process.env.PORT ?? 3030);
}

void bootstrap();
