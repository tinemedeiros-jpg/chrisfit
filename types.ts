
export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  promoPrice?: number | null;
  isPromo?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  isNew?: boolean;
  isLastUnits?: boolean;
  isBestSeller?: boolean;
  sizes: string[];
  images: Array<string | null>;
  observation?: string | null;
  description?: string | null;
  colors?: string[];
  defaultColor?: string | null;
  disabledColors?: string[];
  colorMedia?: Record<string, Array<string | null>>;
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
  isNew?: boolean;
  isLastUnits?: boolean;
  isBestSeller?: boolean;
  sizes: string[];
  observation?: string;
  description?: string;
  colors?: string[];
  defaultColor?: string | null;
  disabledColors?: string[];
  existingImages: Array<string | null>;
  newImages: Array<File | null>;
  colorMedia?: Record<string, Array<string | null>>;
  newColorMedia?: Record<string, Array<File | null>>;
}
