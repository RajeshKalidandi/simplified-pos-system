-- Create tables for restaurant ordering system

-- Create enum for table status
CREATE TYPE public.table_status AS ENUM ('available', 'occupied', 'reserved');

-- Create enum for order status  
CREATE TYPE public.order_status AS ENUM ('pending', 'preparing', 'ready', 'served', 'cancelled');

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'waiter');

-- Create profiles table for user roles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'waiter',
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tables table
CREATE TABLE public.tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER NOT NULL UNIQUE,
  seats INTEGER NOT NULL DEFAULT 4,
  status table_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID NOT NULL REFERENCES public.tables(id),
  waiter_id UUID REFERENCES public.profiles(id),
  status order_status NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- Create RLS policies for tables
CREATE POLICY "Everyone can view tables" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update tables" ON public.tables FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for menu_items
CREATE POLICY "Everyone can view menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage menu items" ON public.menu_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for orders
CREATE POLICY "Authenticated users can view orders" ON public.orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update orders" ON public.orders FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create RLS policies for order_items
CREATE POLICY "Authenticated users can view order items" ON public.order_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert order items" ON public.order_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON public.tables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample tables
INSERT INTO public.tables (table_number, seats, status) VALUES
(1, 4, 'available'),
(2, 4, 'available'),
(3, 6, 'available'),
(4, 2, 'available'),
(5, 4, 'occupied'),
(6, 8, 'available'),
(7, 4, 'available'),
(8, 2, 'occupied');

-- Insert sample menu items
INSERT INTO public.menu_items (name, description, price, category) VALUES
('Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and basil', 12.99, 'Pizza'),
('Pepperoni Pizza', 'Pizza with tomato sauce, mozzarella, and pepperoni', 14.99, 'Pizza'),
('Caesar Salad', 'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan', 8.99, 'Salad'),
('Grilled Chicken', 'Juicy grilled chicken breast with herbs', 16.99, 'Main Course'),
('Pasta Carbonara', 'Creamy pasta with bacon, eggs, and parmesan cheese', 13.99, 'Pasta'),
('Chocolate Cake', 'Rich chocolate cake with chocolate frosting', 6.99, 'Dessert'),
('Coca Cola', 'Refreshing cola drink', 2.99, 'Beverage'),
('Water', 'Still water bottle', 1.99, 'Beverage');