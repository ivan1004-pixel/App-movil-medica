import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // IMPORTA ESTO

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // AÑADE ESTA LÍNEA: Activa las validaciones del DTO
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
