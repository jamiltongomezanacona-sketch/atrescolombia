export type ContentStatus = "active" | "hidden" | "archived";

export type AdminCategory = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  status: ContentStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string | null;
  subcategory_id: string | null;
  price: number;
  previous_price: number | null;
  discount_percent: number | null;
  sku: string;
  inventory_total: number;
  status: ContentStatus;
  is_featured: boolean;
  is_new: boolean;
  is_promo: boolean;
  tags: string[];
  collection: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type AdminProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  alt: string;
  aspect_ratio: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
};

export type AdminBanner = {
  id: string;
  title: string;
  subtitle: string;
  button_text: string;
  link_url: string;
  desktop_image_url: string | null;
  mobile_image_url: string | null;
  start_at: string | null;
  end_at: string | null;
  status: ContentStatus;
  position: "home_hero" | "home_promo" | "category_top";
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type AdminPromotion = {
  id: string;
  name: string;
  slug: string;
  description: string;
  discount_type: "percent" | "fixed_price";
  discount_value: number;
  start_at: string | null;
  end_at: string | null;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
};

export type StoreSettings = {
  id: number;
  store_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  hero_banner_url: string | null;
  whatsapp: string;
  email: string;
  instagram: string;
  tiktok: string;
  address: string;
  shipping_text: string;
  policies: string;
  promo_message: string;
  updated_at: string;
};
