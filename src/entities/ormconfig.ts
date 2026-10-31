import { config } from 'dotenv';

config();

export default {
  name: 'default',
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'biolock',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  entities: ['src/entities/entities/*.js'],
  logging: true,
};
