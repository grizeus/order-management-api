import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import applicationData from '../package.json';
import 'dotenv/config';
import * as process from 'process';
import { DataSource } from 'typeorm';

(async () => {
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
  if (process.env.NODE_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle(applicationData.name)
      .setDescription(applicationData.description)
      .setVersion(applicationData.version)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }

  const PORT = process.env.PORT || 3000;

  await app.listen(PORT);
  console.info(
    `${applicationData.name} server STARTED on port: ${PORT}\n`,
    `\nDB Default DataSource initialized:`,
    app.get(DataSource).isInitialized,
  );
})();
