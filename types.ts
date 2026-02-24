
export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  promoPrice?: number | null;
  isPromo?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  sizes: string[];
  images: Array<string | null>;
  observation?: string | null;
  description?: string | null;
  colors?: string[];
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
  isActive?: boolean;
  sizes: string[];
  observation?: string;
  description?: string;
  colors?: string[];
  existingImages: Array<string | null>;
  newImages: Array<File | null>;
}
