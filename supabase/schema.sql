-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'empleado');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'empleado',
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT UNIQUE,
  category TEXT,
  unit TEXT NOT NULL DEFAULT 'unidad',
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  max_stock INTEGER,
  price DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Movements table (entradas y salidas)
CREATE TABLE public.movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'salida')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_movements_product_id ON public.movements(product_id);
CREATE INDEX idx_movements_user_id ON public.movements(user_id);
CREATE INDEX idx_movements_created_at ON public.movements(created_at);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_barcode ON public.products(barcode);

-- Function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'entrada' THEN
    UPDATE public.products
    SET current_stock = current_stock + NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
  ELSIF NEW.type = 'salida' THEN
    UPDATE public.products
    SET current_stock = current_stock - NEW.quantity,
        updated_at = NOW()
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stock
CREATE TRIGGER trigger_update_stock
AFTER INSERT ON public.movements
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'empleado');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update user roles"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Products policies
CREATE POLICY "Everyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON public.products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products"
  ON public.products FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Movements policies
CREATE POLICY "Everyone can view movements"
  ON public.movements FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert movements"
  ON public.movements FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- View for monthly reports
CREATE OR REPLACE VIEW monthly_movements AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  product_id,
  SUM(CASE WHEN type = 'entrada' THEN quantity ELSE 0 END) as entradas,
  SUM(CASE WHEN type = 'salida' THEN quantity ELSE 0 END) as salidas
FROM public.movements
GROUP BY DATE_TRUNC('month', created_at), product_id;

