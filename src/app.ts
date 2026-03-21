import fastify from 'fastify';
import dotenv from 'dotenv';
import { productsRouter } from './routes/products';

dotenv.config();

const app = fastify({ logger: true });

app.register(productsRouter, { prefix: '/api' });

app.setErrorHandler((error, _req, reply) => {
  reply.status(500).send({ message: 'Internal Server Error' });
});

const start = async () => {
  try {
    await app.listen({ 
      port: Number(process.env.PORT || 4000),
      host: '0.0.0.0'
    });
    console.log(`Server running at http://localhost:${process.env.PORT || 4000}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
