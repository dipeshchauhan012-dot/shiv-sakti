export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banquet_enquiries: {
        Row: {
          created_at: string
          event_date: string
          event_type: string
          guest_count: number
          id: string
          message: string | null
          name: string
          phone: string
          status: Database["public"]["Enums"]["banquet_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_date: string
          event_type: string
          guest_count: number
          id?: string
          message?: string | null
          name: string
          phone: string
          status?: Database["public"]["Enums"]["banquet_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_date?: string
          event_type?: string
          guest_count?: number
          id?: string
          message?: string | null
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["banquet_status"]
          updated_at?: string
        }
        Relationships: []
      }
      contact_leads: {
        Row: {
          created_at: string
          email: string | null
          handled: boolean
          id: string
          message: string
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          handled?: boolean
          id?: string
          message: string
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          email?: string | null
          handled?: boolean
          id?: string
          message?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          min_order: number
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          min_order?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          min_order?: number
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          landmark: string | null
          name: string
          phone: string
          total_orders: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          landmark?: string | null
          name: string
          phone: string
          total_orders?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          landmark?: string | null
          name?: string
          phone?: string
          total_orders?: number
          updated_at?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          category: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          title: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          title?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          title?: string | null
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          customer_id: string
          id: string
          points: number
          updated_at: string
        }
        Insert: {
          customer_id: string
          id?: string
          points?: number
          updated_at?: string
        }
        Update: {
          customer_id?: string
          id?: string
          points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_featured: boolean
          is_popular: boolean
          is_special: boolean
          is_veg: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          is_popular?: boolean
          is_special?: boolean
          is_veg?: boolean
          name: string
          price: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          is_popular?: boolean
          is_special?: boolean
          is_veg?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          item_name: string
          line_total: number
          menu_item_id: string | null
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          line_total: number
          menu_item_id?: string | null
          order_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          line_total?: number
          menu_item_id?: string | null
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          created_at: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          id: string
          landmark: string | null
          notes: string | null
          order_number: number
          order_type: Database["public"]["Enums"]["order_type"]
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          landmark?: string | null
          notes?: string | null
          order_number?: number
          order_type: Database["public"]["Enums"]["order_type"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          landmark?: string | null
          notes?: string | null
          order_number?: number
          order_type?: Database["public"]["Enums"]["order_type"]
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string
          guest_count: number
          id: string
          name: string
          phone: string
          reservation_date: string
          reservation_time: string
          special_request: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_count: number
          id?: string
          name: string
          phone: string
          reservation_date: string
          reservation_time: string
          special_request?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_count?: number
          id?: string
          name?: string
          phone?: string
          reservation_date?: string
          reservation_time?: string
          special_request?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff"
      banquet_status:
        | "new"
        | "contacted"
        | "negotiation"
        | "confirmed"
        | "completed"
        | "cancelled"
      order_status:
        | "pending"
        | "confirmed"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      order_type: "dine_in" | "takeaway" | "delivery"
      reservation_status:
        | "new"
        | "confirmed"
        | "seated"
        | "cancelled"
        | "no_show"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff"],
      banquet_status: [
        "new",
        "contacted",
        "negotiation",
        "confirmed",
        "completed",
        "cancelled",
      ],
      order_status: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      order_type: ["dine_in", "takeaway", "delivery"],
      reservation_status: [
        "new",
        "confirmed",
        "seated",
        "cancelled",
        "no_show",
      ],
    },
  },
} as const
