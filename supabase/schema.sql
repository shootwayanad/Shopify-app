-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create shops table
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_domain TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  scope TEXT,
  is_active BOOLEAN DEFAULT true,
  plan TEXT DEFAULT 'free',
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  liquid_code TEXT NOT NULL,
  schema_json JSONB NOT NULL,
  css_code TEXT,
  js_code TEXT,
  preview_image_url TEXT,
  is_free BOOLEAN DEFAULT false,
  price DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  downloads_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create section_installations table
CREATE TABLE IF NOT EXISTS section_installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shop_id, section_id)
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT DEFAULT 'pending',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shop_id, section_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shops_domain ON shops(shop_domain);
CREATE INDEX IF NOT EXISTS idx_sections_category ON sections(category_id);
CREATE INDEX IF NOT EXISTS idx_sections_active ON sections(is_active);
CREATE INDEX IF NOT EXISTS idx_installations_shop ON section_installations(shop_id);
CREATE INDEX IF NOT EXISTS idx_installations_section ON section_installations(section_id);
CREATE INDEX IF NOT EXISTS idx_purchases_shop ON purchases(shop_id);

-- Enable Row Level Security
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Sections are viewable by everyone" ON sections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Shops can view their own data" ON shops
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Shops can update their own data" ON shops
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
  ('Hero Sections', 'hero', 'Eye-catching hero sections for your homepage', 'Sparkles', 1),
  ('Trust & Social Proof', 'trust', 'Build credibility with testimonials and trust badges', 'Shield', 2),
  ('Features', 'features', 'Showcase your product features beautifully', 'Zap', 3),
  ('FAQ', 'faq', 'Answer common questions with style', 'HelpCircle', 4),
  ('Call to Action', 'cta', 'Drive conversions with compelling CTAs', 'Target', 5),
  ('Product Display', 'products', 'Showcase your products elegantly', 'ShoppingBag', 6),
  ('About & Team', 'about', 'Tell your story and introduce your team', 'Users', 7),
  ('Media', 'media', 'Video and image galleries', 'Image', 8)
ON CONFLICT (slug) DO NOTHING;