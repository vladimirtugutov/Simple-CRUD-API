/// <reference types="vitest" />
/// <reference types="supertest" />
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config();

let testServer: any = null;
let appInstance: any = null;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  vi.stubGlobal('exit', vi.fn());
  
  const module = await import('../src/app.ts');
  appInstance = module.app;

  await appInstance.listen({ port: 0 });
  testServer = appInstance.server;
  
  await new Promise(r => setTimeout(r, 200));
});

afterAll(async () => {
  if (appInstance) {
    await appInstance.close();
  }
  vi.unstubAllGlobals();
});

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
};

type ErrorResponse = {
  message: string;
  issues?: Array<{
    path: string[];
    message: string;
  }>;
};

type ApiResponse<T> = { 
  statusCode: number; 
  data: T;
};

const makeRequest = async <T>(
  path: string,
  method: 'get' | 'post' | 'put' | 'delete',
  body?: Partial<Product>
): Promise<ApiResponse<T>> => {
  const agent = request(testServer);
  let res: any;

  switch (method) {
    case 'get':
      res = await agent.get(path);
      break;
    case 'post':
      res = await agent.post(path).send(body);
      break;
    case 'put':
      res = await agent.put(path).send(body);
      break;
    case 'delete':
      res = await agent.delete(path);
      break;
  }

  return { 
    statusCode: res.status, 
    data: res.body as T 
  };
};

describe('Scenario 1: Full CRUD flow for /api/products', () => {
  let productId: string;

  it('GET /api/products → should return empty array initially', async () => {
    const res = await makeRequest<Product[]>('/api/products', 'get');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBe(0);
  });

  it('POST /api/products → should create valid product', async () => {
    const newProduct: Partial<Product> = {
      name: 'iPhone 15',
      description: 'Latest smartphone',
      price: 999,
      category: 'electronics',
      inStock: true,
    };

    const res = await makeRequest<Product>('/api/products', 'post', newProduct);
    expect(res.statusCode).toBe(201);
    expect(typeof res.data.id).toBe('string');
    expect(res.data.name).toBe('iPhone 15');
    productId = res.data.id;
  });

  it('GET /api/products/:id → should return created product', async () => {
    const res = await makeRequest<Product>(`/api/products/${productId}`, 'get');
    expect(res.statusCode).toBe(200);
    expect(res.data.id).toBe(productId);
    expect(res.data.price).toBe(999);
  });

  it('PUT /api/products/:id → should update product', async () => {
    const updated: Partial<Product> = {
      name: 'iPhone 15 Pro',
      description: 'Pro version',
      price: 1099,
      category: 'electronics',
      inStock: false,
    };

    const res = await makeRequest<Product>(`/api/products/${productId}`, 'put', updated);
    expect(res.statusCode).toBe(200);
    expect(res.data.id).toBe(productId);
    expect(res.data.name).toBe('iPhone 15 Pro');
  });

  it('DELETE /api/products/:id → should delete product', async () => {
    const res = await makeRequest(`/api/products/${productId}`, 'delete');
    expect(res.statusCode).toBe(204);
  });

  it('GET /api/products/:id → after delete should return 404', async () => {
    const res = await makeRequest<ErrorResponse>(`/api/products/${productId}`, 'get');
    expect(res.statusCode).toBe(404);
    expect(res.data.message).toBe('Product not found');
  });
});

describe('Scenario 2: Zod validation errors', () => {
  it('POST → should reject price = 0', async () => {
    const invalid: Partial<Product> = {
      name: 'Invalid price',
      description: 'Zero price test',
      price: 0,
      category: 'test',
      inStock: true,
    };

    const res = await makeRequest<ErrorResponse>('/api/products', 'post', invalid);
    expect(res.statusCode).toBe(400);
    expect(res.data.message).toBe('Invalid product data');
  });

  it('POST → should reject empty name', async () => {
    const invalid: Partial<Product> = {
      name: '',
      description: 'Empty name test',
      price: 100,
      category: 'test',
      inStock: true,
    };

    const res = await makeRequest<ErrorResponse>('/api/products', 'post', invalid);
    expect(res.statusCode).toBe(400);
    expect(res.data.message).toBe('Invalid product data');
  });
});

describe('Scenario 3: UUID validation errors', () => {
  it('GET → invalid UUID → 400', async () => {
    const res = await makeRequest<ErrorResponse>('/api/products/not-a-uuid', 'get');
    expect(res.statusCode).toBe(400);
    expect(res.data.message).toBe('Invalid product ID');
  });

  it('DELETE → invalid UUID → 400', async () => {
    const res = await makeRequest<ErrorResponse>('/api/products/not-a-uuid', 'delete');
    expect(res.statusCode).toBe(400);
    expect(res.data.message).toBe('Invalid product ID');
  });
});

describe('Scenario 4: Multiple products', () => {
  it('should create multiple products and list them', async () => {
    const p1: Partial<Product> = {
      name: 'Multi 1',
      description: 'Test multiple 1',
      price: 10,
      category: 'multi',
      inStock: true,
    };

    const p2: Partial<Product> = {
      name: 'Multi 2',
      description: 'Test multiple 2',
      price: 20,
      category: 'multi',
      inStock: false,
    };

    await makeRequest('/api/products', 'post', p1);
    await makeRequest('/api/products', 'post', p2);

    const res = await makeRequest<Product[]>('/api/products', 'get');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThanOrEqual(2);
  });
});
