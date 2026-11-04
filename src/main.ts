import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      const allowed = (process.env.CORS_ORIGINS ?? 'http://localhost:4200').split(',');
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('CORS no permitido'));
    },
    credentials: true,
  });

  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  await app.listen(process.env.PORT ?? 3030);
}

void bootstrap();
