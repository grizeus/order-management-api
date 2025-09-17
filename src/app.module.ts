import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { Product, User, Order } from './db/entities';
import { OrderModule } from './order/order.module';
import { AuthModule } from './auth/auth.module';


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
            queueLimit: 0,
            connectTimeout: 10000,
          },
          entities: [User, Product, Order],
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    ConfigModule,
    OrderModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
