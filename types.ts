
export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  promoPrice?: number | null;
  isPromo?: boolean;
  isFeatured?: boolean;
  sizes: string[];
  images: Array<string | null>;
  observation?: string | null;
  createdAt: string;
}

export type ViewMode = 'catalog' | 'admin';

export interface ProductUpsertPayload {
  id?: string;
  code: string;
  name: string;
  price: number;
  promoPrice?: number | null;
  isPromo?: boolean;
  isFeatured?: boolean;
  sizes: string[];
  observation?: string;
  existingImages: Array<string | null>;
  newImages: Array<File | null>;
}
