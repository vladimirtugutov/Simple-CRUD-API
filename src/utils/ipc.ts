import type { MessageToWorker, Product } from '../db';

// Type guards
export const isAllProducts = (msg: MessageToWorker): msg is { type: 'ALL_PRODUCTS'; payload: Product[] } => 
  msg.type === 'ALL_PRODUCTS';

export const isProductCreated = (msg: MessageToWorker): msg is { type: 'PRODUCT_CREATED'; payload: Product } => 
  msg.type === 'PRODUCT_CREATED';

export const isProductFound = (msg: MessageToWorker): msg is { type: 'PRODUCT_FOUND'; payload: Product } => 
  msg.type === 'PRODUCT_FOUND';

export const isProductUpdated = (msg: MessageToWorker): msg is { type: 'PRODUCT_UPDATED'; payload: Product } => 
  msg.type === 'PRODUCT_UPDATED';

export const isProductDeleted = (msg: MessageToWorker): msg is { type: 'PRODUCT_DELETED' } => 
  msg.type === 'PRODUCT_DELETED';

export const isProductResponse = (msg: MessageToWorker): msg is Extract<MessageToWorker, { payload: Product }> => 
  msg.type === 'PRODUCT_CREATED' || 
  msg.type === 'PRODUCT_FOUND' || 
  msg.type === 'PRODUCT_UPDATED';
