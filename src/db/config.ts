import { DataSourceOptions } from 'typeorm';
import 'dotenv/config';
import { User } from './entities/users.entity';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,

  entities: [User],
  migrations: ['./migrations/*{.ts,.js}'],
};

export default dataSourceOptions;
