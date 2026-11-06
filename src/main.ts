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
        const message = errors
          .map((error) => Object.values(error.constraints ?? {}))
          .flat()
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
