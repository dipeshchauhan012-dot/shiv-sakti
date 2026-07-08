import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_veg: boolean;
  is_available: boolean;
  is_featured: boolean;
  is_popular: boolean;
  is_special: boolean;
  sort_order: number;
};

export type MenuData = { categories: MenuCategory[]; items: MenuItem[] };

export async function fetchMenu(): Promise<MenuData> {
  const [{ data: cats, error: cErr }, { data: items, error: iErr }] = await Promise.all([
    supabase.from("menu_categories").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("menu_items").select("*").order("sort_order"),
  ]);
  if (cErr) throw cErr;
  if (iErr) throw iErr;
  return {
    categories: (cats ?? []) as MenuCategory[],
    items: ((items ?? []) as unknown as MenuItem[]).map((i) => ({
      ...i,
      price: Number(i.price),
    })),
  };
}

export const menuQueryOptions = () =>
  queryOptions({
    queryKey: ["menu"],
    queryFn: fetchMenu,
    staleTime: 60_000,
  });
