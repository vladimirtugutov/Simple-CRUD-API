export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
};

export let products: Product[] = [];

export type MessageFromWorker =
  | { type: 'GET_ALL_PRODUCTS' }
  | { type: 'CREATE_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'GET_PRODUCT_BY_ID'; payload: string };

export type MessageToWorker =
  | { type: 'ALL_PRODUCTS'; payload: Product[] }
  | { type: 'PRODUCT_CREATED'; payload: Product }
  | { type: 'PRODUCT_FOUND'; payload: Product }
  | { type: 'PRODUCT_UPDATED'; payload: Product }
  | { type: 'PRODUCT_DELETED' }
  | { type: 'PRODUCT_NOT_FOUND' }
  | { type: 'INVALID_PRODUCT_ID' };
