
-- Roles (for future admin)
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Update timestamp helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Menu categories
CREATE TABLE public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_categories TO anon, authenticated;
GRANT ALL ON public.menu_categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.menu_categories TO authenticated;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read categories" ON public.menu_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.menu_categories FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_menu_categories_updated BEFORE UPDATE ON public.menu_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Menu items
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  image_url text,
  is_veg boolean NOT NULL DEFAULT true,
  is_available boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_popular boolean NOT NULL DEFAULT false,
  is_special boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Admins manage menu items" ON public.menu_items FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_menu_items_updated BEFORE UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);

-- Customers
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text,
  address text,
  landmark text,
  total_orders int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.customers TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can create customer record" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read customers" ON public.customers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update customers" ON public.customers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete customers" ON public.customers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Orders
CREATE TYPE public.order_type AS ENUM ('dine_in', 'takeaway', 'delivery');
CREATE TYPE public.order_status AS ENUM ('pending','confirmed','preparing','ready','out_for_delivery','delivered','cancelled');

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number bigserial UNIQUE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  order_type public.order_type NOT NULL,
  status public.order_status NOT NULL DEFAULT 'pending',
  address text,
  landmark text,
  notes text,
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.orders_order_number_seq TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can place orders" ON public.orders FOR INSERT WITH CHECK (
  length(customer_name) BETWEEN 2 AND 120
  AND length(customer_phone) BETWEEN 7 AND 20
  AND subtotal > 0
);
CREATE POLICY "Admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Order items
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity int NOT NULL CHECK (quantity > 0),
  line_total numeric(10,2) NOT NULL CHECK (line_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.order_items TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (
  quantity > 0 AND unit_price >= 0
);
CREATE POLICY "Admins read order items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update order items" ON public.order_items FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete order items" ON public.order_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- Reservations
CREATE TYPE public.reservation_status AS ENUM ('new','confirmed','seated','cancelled','no_show');
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  reservation_date date NOT NULL,
  reservation_time time NOT NULL,
  guest_count int NOT NULL CHECK (guest_count > 0 AND guest_count <= 200),
  special_request text,
  status public.reservation_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.reservations TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can create reservation" ON public.reservations FOR INSERT WITH CHECK (
  length(name) BETWEEN 2 AND 120 AND length(phone) BETWEEN 7 AND 20
);
CREATE POLICY "Admins read reservations" ON public.reservations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update reservations" ON public.reservations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete reservations" ON public.reservations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_reservations_updated BEFORE UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Banquet enquiries
CREATE TYPE public.banquet_status AS ENUM ('new','contacted','negotiation','confirmed','completed','cancelled');
CREATE TABLE public.banquet_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  event_date date NOT NULL,
  guest_count int NOT NULL CHECK (guest_count > 0 AND guest_count <= 2000),
  event_type text NOT NULL,
  message text,
  status public.banquet_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.banquet_enquiries TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.banquet_enquiries TO authenticated;
GRANT ALL ON public.banquet_enquiries TO service_role;
ALTER TABLE public.banquet_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit banquet enquiry" ON public.banquet_enquiries FOR INSERT WITH CHECK (
  length(name) BETWEEN 2 AND 120 AND length(phone) BETWEEN 7 AND 20
);
CREATE POLICY "Admins read banquet" ON public.banquet_enquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update banquet" ON public.banquet_enquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete banquet" ON public.banquet_enquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_banquet_updated BEFORE UPDATE ON public.banquet_enquiries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contact leads
CREATE TABLE public.contact_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text NOT NULL,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_leads TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_leads TO authenticated;
GRANT ALL ON public.contact_leads TO service_role;
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can send contact message" ON public.contact_leads FOR INSERT WITH CHECK (
  length(name) BETWEEN 2 AND 120 AND length(phone) BETWEEN 7 AND 20 AND length(message) BETWEEN 2 AND 2000
);
CREATE POLICY "Admins read contact" ON public.contact_leads FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update contact" ON public.contact_leads FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete contact" ON public.contact_leads FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Gallery
CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  image_url text NOT NULL,
  category text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view gallery" ON public.gallery FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage gallery" ON public.gallery FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Settings (single-row key/value)
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Future-ready: coupons and loyalty (schema only)
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL CHECK (discount_type IN ('percent','flat')),
  discount_value numeric(10,2) NOT NULL CHECK (discount_value >= 0),
  min_order numeric(10,2) NOT NULL DEFAULT 0,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  points int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id)
);
GRANT SELECT, UPDATE ON public.loyalty_points TO authenticated;
GRANT ALL ON public.loyalty_points TO service_role;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage loyalty" ON public.loyalty_points FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed settings
INSERT INTO public.settings (key, value) VALUES
('restaurant', jsonb_build_object(
  'name','Shiv Shakti Restaurant & Banquet',
  'tagline','Pure Veg Family Restaurant & Banquet Hall',
  'address','Shop No. 8 & 9, Green Residency Commercial Shopping Center, Opp. Madhav Chrest, Surat, Gujarat',
  'phones', jsonb_build_array('9898653141','7999620244','7284948729'),
  'whatsapp','7999620244',
  'instagram','shivshakti_dindoli',
  'maps','https://maps.app.goo.gl/R7jkphawn4zpKCJ88',
  'lunch','11:00 AM – 3:30 PM',
  'dinner','6:30 PM – 10:45 PM'
));
