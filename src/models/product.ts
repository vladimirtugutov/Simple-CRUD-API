import { v4 as uuidv4 } from 'uuid';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
};

export const products: Product[] = [];  // Глобальная база

export const createProduct = (
  name: string, 
  description: string, 
  price: number, 
  category: string, 
  inStock: boolean
): Product => {
  const newProduct: Product = {
    id: uuidv4(),
    name, description, price, category, inStock
  };
  products.push(newProduct);
  return newProduct;
};
