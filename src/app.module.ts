import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './configuration';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: 'default',
      useFactory: async () => {
        return {
          name: 'default',
          type: 'postgres',
          url: process.env.DATABASE_URL,
          extra: {
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0, // unlimited
            connectTimeout: 10000, // 10 seconds
          },
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
