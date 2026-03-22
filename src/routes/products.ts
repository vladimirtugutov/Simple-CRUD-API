import { FastifyInstance } from 'fastify';
import { productController } from '../controllers/productController';

export async function productsRouter(fastify: FastifyInstance) {
  fastify.get('/products', productController.getAll);
  fastify.post('/products', productController.create);
  fastify.get('/products/:id', productController.getOne);
  fastify.put('/products/:id', productController.update);
  fastify.delete('/products/:id', productController.remove);
}
