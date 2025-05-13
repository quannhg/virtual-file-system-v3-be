import { envs } from '@configs';
import { createServer } from './Server';

const PORT = 8888;
const HOST = envs.isDev ? 'localhost' : '0.0.0.0';

async function bootstrap() {
  const app = await createServer({ host: HOST, port: PORT });
  app.start();
}

bootstrap();
