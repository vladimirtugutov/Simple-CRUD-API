import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import dotenv from 'dotenv';
import { MessageFromWorker, MessageToWorker } from './db';
import { v4 as uuidv4 } from 'uuid';
import { validate as isUuid } from 'uuid';
import { z } from 'zod';
import { 
  isAllProducts, 
  isProductCreated,
  isProductDeleted,
  isProductResponse
} from './utils/ipc';

dotenv.config();

const WORKER_ID = Number(process.env.WORKER_ID || 1);
const BASE_PORT = Number(process.env.PORT || 4000);
const PORT = BASE_PORT + WORKER_ID;

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
};

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  inStock: z.boolean(),
});

const sendToMaster = (message: MessageFromWorker): Promise<MessageToWorker> => {
  return new Promise((resolve) => {
    const handler = (msg: MessageToWorker) => {
      process.off('message', handler);
      resolve(msg);
    };
    process.on('message', handler);
    process.send?.(message);
  });
};

const app = fastify({ logger: true });

// GET /api/products
app.get('/api/products', async (_req, reply) => {
  console.log(`[W${WORKER_ID}] GET /api/products`);
  const response = await sendToMaster({ type: 'GET_ALL_PRODUCTS' });
  if (isAllProducts(response)) {
    reply.send(response.payload);
  } else {
    reply.status(500).send({ message: 'Failed to fetch products' });
  }
});

// POST /api/products
app.post('/api/products', async (req: FastifyRequest<{ Body: z.infer<typeof productSchema> }>, reply) => {
  console.log(`[W${WORKER_ID}] POST /api/products`);
  try {
    const productData = productSchema.parse(req.body);
    
    const newProduct: Product = {
      id: uuidv4(),
      ...productData
    };
    
    const response = await sendToMaster({ type: 'CREATE_PRODUCT', payload: newProduct });
    if (isProductCreated(response)) {
      reply.status(201).send(response.payload);
    } else {
      reply.status(500).send({ message: 'Failed to create product' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ 
        message: 'Invalid product data',
        issues: error.issues 
      });
    }
    reply.status(500).send({ message: 'Server error' });
  }
});

// GET /api/products/:id
app.get<{ Params: { id: string } }>('/api/products/:id', async (req, reply) => {
  console.log(`[W${WORKER_ID}] GET /api/products/${req.params.id}`);
  
  if (!isUuid(req.params.id)) {
    return reply.status(400).send({ message: 'Invalid ID' });
  }
  
  const response = await sendToMaster({ type: 'GET_PRODUCT_BY_ID', payload: req.params.id });
  
  if (isProductResponse(response)) {
    reply.send(response.payload);
  } else {
    reply.status(404).send({ message: 'Product not found' });
  }
});

// PUT /api/products/:id
app.put<{ Params: { id: string }; Body: z.infer<typeof productSchema> }>('/api/products/:id', async (req, reply) => {
  console.log(`[W${WORKER_ID}] PUT /api/products/${req.params.id}`);
  
  if (!isUuid(req.params.id)) {
    return reply.status(400).send({ message: 'Invalid ID' });
  }
  
  const updatedProduct: Product = {
    id: req.params.id,
    ...req.body
  };
  
  const response = await sendToMaster({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
  
  if (isProductResponse(response)) {
    reply.send(response.payload);
  } else {
    reply.status(404).send({ message: 'Product not found' });
  }
});

// DELETE /api/products/:id
app.delete<{ Params: { id: string } }>('/api/products/:id', async (req, reply) => {
  console.log(`[W${WORKER_ID}] DELETE /api/products/${req.params.id}`);
  
  if (!isUuid(req.params.id)) {
    return reply.status(400).send({ message: 'Invalid ID' });
  }
  
  const response = await sendToMaster({ type: 'DELETE_PRODUCT', payload: req.params.id });
  
  if (isProductDeleted(response)) {
    reply.status(204).send();
  } else {
    reply.status(404).send({ message: 'Product not found' });
  }
});

app.setErrorHandler((_error, _req, reply) => {
  reply.status(500).send({ message: 'Server error' });
});

app.listen({ port: PORT, host: '0.0.0.0' }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Worker ${process.pid} (ID ${WORKER_ID}) READY on ${PORT}`);
});
