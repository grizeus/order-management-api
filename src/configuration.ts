import * as process from 'process';

export const configuration = () => ({
  server: {
    port: process.env.PORT || 3000,
  },
  database: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
});
