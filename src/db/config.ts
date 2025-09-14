import { DataSourceOptions } from 'typeorm';
import 'dotenv/config';
import { ProductEntity, UserEntity } from './entities';


const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,

  entities: [UserEntity, ProductEntity],
  migrations: ['./migrations/*{.ts,.js}'],
};

export default dataSourceOptions;
