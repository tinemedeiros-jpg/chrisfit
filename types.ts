
export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  sizes: string[];
  images: string[];
  observation?: string | null;
  createdAt: string;
}

export type ViewMode = 'catalog' | 'admin';

export interface ProductUpsertPayload {
  id?: string;
  code: string;
  name: string;
  price: number;
  sizes: string[];
  observation?: string;
  existingImages: string[];
  newImages: File[];
}
