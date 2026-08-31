// Hand-written to match supabase/migrations/*.sql exactly, and kept
// in sync by hand as migrations are added — see supabase/README.md
// for why this isn't auto-regenerated from the live schema.

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "payment_failed";

// Mirrors Razorpay's own payment vocabulary verbatim (Razorpay
// itself reports created/authorized/captured/failed/refunded) rather
// than reusing orders.status's "confirmed" — this table records what
// the gateway actually reported, a different concept from order
// fulfillment stage.
export type PaymentStatus = "created" | "pending" | "authorized" | "captured" | "failed" | "refunded";

export type AppRole = "customer" | "admin";

export type AvailabilityStatus = "in_stock" | "low_stock" | "out_of_stock";

export type HeroDevice = "desktop" | "mobile";

export interface ShippingAddress {
  name: string;
  email: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_storage_path: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          product_type: string | null;
          colour: string | null;
          fabric: string | null;
          price_paise: number;
          compare_at_price_paise: number | null;
          wash_care_instructions: string | null;
          is_active: boolean;
          is_bestseller: boolean;
          is_new_arrival: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          category_id: string;
          name: string;
          slug: string;
          price_paise: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          alt_text: string | null;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["product_images"]["Row"]> & {
          product_id: string;
          storage_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          sku: string | null;
          price_override_paise: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["product_variants"]["Row"]> & {
          product_id: string;
          size: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Row"]>;
        Relationships: [];
      };
      inventory: {
        Row: {
          id: string;
          variant_id: string;
          quantity: number;
          low_stock_threshold: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["inventory"]["Row"]> & {
          variant_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["inventory"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_roles"]["Row"]> & {
          user_id: string;
          role: AppRole;
        };
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Row"]>;
        Relationships: [];
      };
      homepage_slides: {
        Row: {
          id: string;
          device: HeroDevice;
          title: string | null;
          subtitle: string | null;
          image_path: string;
          link_url: string | null;
          cta_label: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["homepage_slides"]["Row"]> & {
          device: HeroDevice;
          image_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["homepage_slides"]["Row"]>;
        Relationships: [];
      };
      bestsellers: {
        Row: {
          id: string;
          product_id: string;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bestsellers"]["Row"]> & {
          product_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["bestsellers"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: OrderStatus;
          subtotal_paise: number;
          shipping_paise: number;
          total_paise: number;
          currency: string;
          shipping_address: ShippingAddress;
          razorpay_order_id: string | null;
          customer_email: string | null;
          placed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          subtotal_paise: number;
          total_paise: number;
          shipping_address: ShippingAddress;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name: string;
          size: string;
          unit_price_paise: number;
          quantity: number;
          line_total_paise: number;
          primary_image_path: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: string;
          product_id: string;
          variant_id: string;
          product_name: string;
          size: string;
          unit_price_paise: number;
          quantity: number;
          line_total_paise: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          razorpay_order_id: string;
          razorpay_payment_id: string | null;
          razorpay_signature: string | null;
          status: PaymentStatus;
          amount_paise: number;
          raw_webhook_payload: Record<string, unknown> | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          order_id: string;
          razorpay_order_id: string;
          amount_paise: number;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          event_type: string;
          received_at: string;
          payload: Record<string, unknown>;
        };
        Insert: Partial<Database["public"]["Tables"]["webhook_events"]["Row"]> & {
          id: string;
          event_type: string;
          payload: Record<string, unknown>;
        };
        Update: Partial<Database["public"]["Tables"]["webhook_events"]["Row"]>;
        Relationships: [];
      };
      admin_audit_log: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          changes: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_audit_log"]["Row"]> & {
          admin_id: string;
          action: string;
          entity_type: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_audit_log"]["Row"]>;
        Relationships: [];
      };
      inventory_adjustments: {
        Row: {
          id: string;
          variant_id: string;
          admin_id: string;
          old_quantity: number;
          new_quantity: number;
          adjustment_amount: number;
          reason: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["inventory_adjustments"]["Row"]> & {
          variant_id: string;
          admin_id: string;
          old_quantity: number;
          new_quantity: number;
          adjustment_amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["inventory_adjustments"]["Row"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: unknown;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_settings"]["Row"]> & {
          key: string;
          value: unknown;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Relationships: [];
      };
      site_images: {
        Row: {
          key: string;
          storage_path: string | null;
          alt_text: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_images"]["Row"]> & {
          key: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_images"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      get_product_availability: {
        Args: { p_product_id: string };
        Returns: {
          variant_id: string;
          size: string;
          status: AvailabilityStatus;
          low_stock_quantity: number | null;
        }[];
      };
      get_products_sold_out_status: {
        Args: { p_product_ids: string[] };
        Returns: { product_id: string; is_sold_out: boolean }[];
      };
      create_order_for_checkout: {
        Args: {
          p_user_id: string | null;
          p_items: { variant_id: string; quantity: number }[];
          p_shipping_address: ShippingAddress;
          p_shipping_paise: number;
          p_customer_email?: string | null;
        };
        Returns: string;
      };
      get_order_public: {
        Args: { p_order_id: string };
        Returns: Database["public"]["Tables"]["orders"]["Row"][];
      };
      get_order_items_public: {
        Args: { p_order_id: string };
        Returns: Database["public"]["Tables"]["order_items"]["Row"][];
      };
      confirm_paid_order: {
        Args: {
          p_order_id: string;
          p_razorpay_payment_id: string;
          p_razorpay_signature: string;
          p_amount_paise: number;
        };
        Returns: { already_processed: boolean; order_status: OrderStatus }[];
      };
      mark_order_payment_failed: {
        Args: { p_order_id: string };
        Returns: void;
      };
      log_admin_action: {
        Args: {
          p_action: string;
          p_entity_type: string;
          p_entity_id: string | null;
          p_changes?: Record<string, unknown> | null;
        };
        Returns: void;
      };
      adjust_inventory: {
        Args: { p_variant_id: string; p_new_quantity: number; p_reason?: string | null };
        Returns: { old_quantity: number; new_quantity: number }[];
      };
      set_primary_product_image: {
        Args: { p_product_id: string; p_image_id: string };
        Returns: void;
      };
      admin_force_confirm_order: {
        Args: { p_order_id: string; p_reason: string };
        Returns: void;
      };
    };
  };
}
