import fastify from 'fastify';
import { productsRouter } from './routes/products';
import { MessageFromWorker, MessageToWorker } from './db';
import dotenv from 'dotenv';

dotenv.config();

const WORKER_ID = Number(process.env.WORKER_ID || 1);
const BASE_PORT = Number(process.env.PORT || 4000);
const PORT = BASE_PORT + WORKER_ID;

const app = fastify({ logger: true });

app.register(productsRouter, { prefix: '/api' });

app.setErrorHandler((error, _req, reply) => {
  reply.status(500).send({ message: 'Internal Server Error' });
});

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log(`Worker ${process.pid} (ID ${WORKER_ID}) on port ${PORT}`);
});
