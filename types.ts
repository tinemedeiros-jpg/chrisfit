
export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  sizes: string[];
  imageUrl: string;
  observation?: string;
  createdAt: number;
}

export type ViewMode = 'catalog' | 'admin';
