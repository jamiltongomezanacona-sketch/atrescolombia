export type ContentStatus = "active" | "hidden" | "archived";
export type ProductVariantStatus = "available" | "sold_out" | "hidden" | "coming_soon";
export type ProfileRole = "admin" | "superadmin" | "shop_admin";
export type ShopStatus = "active" | "suspended" | "archived";
export type ShopMemberRole = "superadmin" | "shop_admin";

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
  shop_id: string;
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

export type AdminShop = {
  id: string;
  name: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  city: string;
  country?: string;
  department?: string;
  locality?: string;
  neighborhood?: string;
  address?: string;
  address_reference?: string;
  latitude?: number | null;
  longitude?: number | null;
  maps_url?: string | null;
  postal_code?: string;
  delivery_radius_km?: number | null;
  pickup_enabled?: boolean;
  local_delivery_enabled?: boolean;
  location_verified?: boolean;
  whatsapp: string;
  email: string;
  logo_url: string | null;
  cover_url: string | null;
  verified: boolean;
  status: ShopStatus;
  max_products: number;
  max_images: number;
  show_on_home: boolean;
  allow_promotions: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  product_count?: number;
};

export type AdminShopMember = {
  id: string;
  shop_id: string;
  user_id: string;
  role: ShopMemberRole;
  status: ContentStatus;
  created_at: string;
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

export type AdminProductVariant = {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color: string;
  inventory: number;
  price: number | null;
  status: ProductVariantStatus;
  created_at: string;
  updated_at: string;
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
