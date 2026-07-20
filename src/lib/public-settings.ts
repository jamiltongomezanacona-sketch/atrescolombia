import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export type PublicStoreSettings = {
  storeName: string;
  whatsapp: string;
  email: string;
  shippingText: string;
  promoMessage: string;
};

export const getPublicStoreSettings = cache(async function getPublicStoreSettings(): Promise<PublicStoreSettings | null> {
  if (!hasSupabaseEnv()) return null;

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("store_name,whatsapp,email,shipping_text,promo_message")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      storeName: data.store_name || "ATRES",
      whatsapp: data.whatsapp || "",
      email: data.email || "",
      shippingText: data.shipping_text || "",
      promoMessage: data.promo_message || "",
    };
  } catch {
    return null;
  }
});
