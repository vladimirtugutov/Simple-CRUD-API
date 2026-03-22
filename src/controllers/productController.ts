import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { products, createProduct } from '../models/product';
import { validate as isUuid } from 'uuid';

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  inStock: z.boolean(),
});

type ProductRequest = FastifyRequest<{ 
  Params?: { id: string }; 
  Body?: z.infer<typeof productSchema>;
}>;

export const productController = {
  async create(request: ProductRequest, reply: FastifyReply) {
    try {
      const productData = productSchema.parse(request.body);

      const product = createProduct(
        productData.name,
        productData.description,
        productData.price,
        productData.category,
        productData.inStock
      );
      
      return reply.status(201).send(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          message: 'Invalid product data',
          issues: error.issues
        });
      }
      return reply.status(500).send({ message: 'Server error' });
    }
  },

  async getAll() {
    return products;
  },

  async getOne(request: ProductRequest, reply: FastifyReply) {
    const id = (request.params as { id: string } | undefined)?.id;
    
    if (!id || !isUuid(id)) {
      return reply.status(400).send({ message: 'Invalid product ID' });
    }

    const product = products.find(p => p.id === id);
    if (!product) {
      return reply.status(404).send({ message: 'Product not found' });
    }

    return product;
  },

  async update(request: ProductRequest, reply: FastifyReply) {
    const id = (request.params as { id: string } | undefined)?.id;
    
    if (!id || !isUuid(id)) {
      return reply.status(400).send({ message: 'Invalid product ID' });
    }

    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return reply.status(404).send({ message: 'Product not found' });
    }

    try {
      const productData = productSchema.parse(request.body);
      
      products[index] = { 
        id, 
        ...productData 
      };

      return products[index];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          message: 'Invalid product data',
          issues: error.issues
        });
      }
      return reply.status(500).send({ message: 'Server error' });
    }
  },

  async remove(request: ProductRequest, reply: FastifyReply) {
    const id = (request.params as { id: string } | undefined)?.id;
    
    if (!id || !isUuid(id)) {
      return reply.status(400).send({ message: 'Invalid product ID' });
    }

    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return reply.status(404).send({ message: 'Product not found' });
    }

    products.splice(index, 1);
    return reply.status(204).send();
  },
};
