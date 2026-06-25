import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

/**
 * Bootstrap dell'applicazione NestJS. Configura il prefisso globale `/api`,
 * CORS, ValidationPipe (whitelist + transform), Swagger (`/api/docs`),
 * ClassSerializerInterceptor e header Cache-Control no-store su ogni risposta.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Le risposte API non devono mai essere messe in cache dal browser: senza
  // questo header (con il solo ETag di Express) il browser può riusare una copia
  // vecchia di una lista — es. mostrare una sessione già eliminata sul server.
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Nx-NestJS')
    .setDescription('API DOCUMENTATION')
    .setVersion('1.0')
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app,config);

  SwaggerModule.setup('api/docs',app,document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
