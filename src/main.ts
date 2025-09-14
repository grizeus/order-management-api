import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import applicationData from '../package.json';
import 'dotenv/config';
import * as process from 'process';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,POST',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true,
      },
      transform: true,
      whitelist: true,
    }),
  );

  // Enable Swagger
  if (process.env.NODE_ENV !== 'prod') {
    const options = new DocumentBuilder()
      .setTitle(applicationData.name)
      .setDescription(applicationData.description)
      .setVersion(applicationData.version)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;

  await app.listen(port);
  console.info(
    `${applicationData.name} server STARTED on port: ${port}\n`,
    `\nDB Default DataSource initialized:`,
    app.get(DataSource).isInitialized,
  );
}
bootstrap();
