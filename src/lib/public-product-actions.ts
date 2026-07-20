"use server";

import { getPublicProductsBySlugs } from "@/lib/public-store";
import type { Product } from "@/lib/store-data";

export async function loadPublicProductsBySlugs(slugs: string[]): Promise<Product[]> {
  return getPublicProductsBySlugs(slugs);
}
