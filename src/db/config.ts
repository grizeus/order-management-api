import { DataSourceOptions } from 'typeorm';
import 'dotenv/config';
import { Product, User, Order } from './entities';


const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,

  entities: [User, Product, Order],
  migrations: ['./migrations/*{.ts,.js}'],
};

export default dataSourceOptions;
