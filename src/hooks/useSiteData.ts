import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ProductSettings,
  SellerSettings,
  CheckoutSettings,
  ProductDetail,
  CouponItem,
  DEFAULT_PRODUCT,
  DEFAULT_SELLER,
  DEFAULT_CHECKOUT,
} from "@/lib/siteData";

// ----- Mappers (DB row -> typed object) -----
function mapProduct(row: any): ProductSettings {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    installments_text: row.installments_text,
    coupon_code: row.coupon_code,
    coupon_label: row.coupon_label,
    location_neighborhood: row.location_neighborhood,
    location_city: row.location_city,
    location_state: row.location_state,
    location_cep: row.location_cep,
    photos: Array.isArray(row.photos) ? (row.photos as string[]) : DEFAULT_PRODUCT.photos,
    details: Array.isArray(row.details) ? (row.details as ProductDetail[]) : DEFAULT_PRODUCT.details,
  };
}

function mapSeller(row: any): SellerSettings {
  return {
    id: row.id,
    name: row.name,
    masked_name: row.masked_name,
    masked_cpf: row.masked_cpf,
    avatar_url: row.avatar_url,
    verified: row.verified,
    last_seen_text: row.last_seen_text,
    member_since_text: row.member_since_text,
    location_neighborhood: row.location_neighborhood,
    location_city: row.location_city,
    location_state: row.location_state,
    location_cep: row.location_cep,
    profile_url: row.profile_url,
    sales_completed: row.sales_completed,
    sales_cancelled: row.sales_cancelled,
    avg_dispatch_time: row.avg_dispatch_time,
  };
}

function mapCheckout(row: any): CheckoutSettings {
  return {
    id: row.id,
    warranty_price: Number(row.warranty_price),
    shipping_original: Number(row.shipping_original),
    shipping_final: Number(row.shipping_final),
    shipping_days: row.shipping_days,
    pickup_location: row.pickup_location,
    coupons: Array.isArray(row.coupons) ? (row.coupons as CouponItem[]) : DEFAULT_CHECKOUT.coupons,
  };
}

// ----- Hook genérico -----
export function useProductSettings() {
  const [data, setData] = useState<ProductSettings>(DEFAULT_PRODUCT);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data: row, error } = await supabase
      .from("product_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (!error && row) setData(mapProduct(row));
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const channel = supabase
      .channel("product_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_settings" },
        (payload) => {
          if (payload.new) setData(mapProduct(payload.new));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  return { data, loading, reload };
}

export function useSellerSettings() {
  const [data, setData] = useState<SellerSettings>(DEFAULT_SELLER);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data: row, error } = await supabase
      .from("seller_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (!error && row) setData(mapSeller(row));
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const channel = supabase
      .channel("seller_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "seller_settings" },
        (payload) => {
          if (payload.new) setData(mapSeller(payload.new));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  return { data, loading, reload };
}

export function useCheckoutSettings() {
  const [data, setData] = useState<CheckoutSettings>(DEFAULT_CHECKOUT);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data: row, error } = await supabase
      .from("checkout_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (!error && row) setData(mapCheckout(row));
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    const channel = supabase
      .channel("checkout_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkout_settings" },
        (payload) => {
          if (payload.new) setData(mapCheckout(payload.new));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  return { data, loading, reload };
}
