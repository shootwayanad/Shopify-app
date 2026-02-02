# Section Store MVP - Shopify App

A complete Shopify app that allows merchants to browse and install pre-built theme sections with one click. Built with Next.js 14, Supabase, and deployed on Vercel.

## 🚀 Features

### For Merchants
- **Browse 700+ Premium Sections** - Hero sections, testimonials, FAQs, CTAs, and more
- **One-Click Installation** - Sections install directly to your active theme
- **Category Filtering** - Find exactly what you need quickly
- **Free & Paid Sections** - Flexible monetization options
- **Live Preview** - See what sections look like before installing
- **Search Functionality** - Find sections by name or description

### For Admins
- **Beautiful Admin Dashboard** - Manage all sections from one place
- **CRUD Operations** - Create, read, update, and delete sections
- **Statistics Dashboard** - Track downloads, ratings, and performance
- **Category Management** - Organize sections efficiently
- **Real-time Updates** - Changes reflect immediately

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Shopify OAuth
- **Deployment**: Vercel
- **Shopify Integration**: Theme Asset API, App Bridge

## 📋 Prerequisites

- Node.js 18+ and npm
- A Shopify Partner account
- A Supabase account
- A Vercel account (for deployment)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd section-store-mvp
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project URL and anon key from Settings > API

### 3. Create Shopify App

1. Go to [Shopify Partners Dashboard](https://partners.shopify.com)
2. Click "Apps" > "Create app" > "Create app manually"
3. Fill in app details:
   - **App name**: Section Store
   - **App URL**: `https://your-vercel-url.vercel.app`
   - **Allowed redirection URL(s)**: `https://your-vercel-url.vercel.app/api/auth/callback`
4. Configure scopes:
   - `write_themes`
   - `read_themes`
   - `write_products`
   - `read_products`
5. Save your API credentials

### 4. Configure Environment Variables

Create a `.env.local` file:

```bash
# Shopify
NEXT_PUBLIC_SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=https://your-vercel-url.vercel.app
SHOPIFY_SCOPES=write_themes,read_themes,write_products,read_products

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_NAME=Section Store
JWT_SECRET=your_random_32_character_secret
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 📦 Deployment to Vercel

### Option 1: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

### Option 2: Using GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add all environment variables from `.env.local`
6. Click "Deploy"

### After Deployment

1. Update your Shopify app settings with the new Vercel URL
2. Update the `SHOPIFY_APP_URL` environment variable in Vercel
3. Test the OAuth flow by installing the app on a development store

## 🗄️ Database Schema

The app uses the following main tables:

- **shops** - Stores Shopify shop credentials
- **categories** - Section categories (Hero, Trust, Features, etc.)
- **sections** - Theme sections library
- **section_installations** - Tracks which shops installed which sections
- **purchases** - Payment records for paid sections
- **reviews** - Section ratings and reviews

## 📡 API Endpoints

### Public Endpoints

- `GET /api/categories` - List all categories
- `GET /api/sections` - List sections (with optional filters)
- `POST /api/sections/install` - Install a section to a shop

### Admin Endpoints

- `GET /api/admin/sections` - List all sections (admin view)
- `POST /api/admin/sections` - Create a new section
- `PUT /api/admin/sections` - Update a section
- `DELETE /api/admin/sections` - Delete a section

### Auth Endpoints

- `GET /api/auth` - Initiate Shopify OAuth
- `GET /api/auth/callback` - OAuth callback handler

## 🎨 Creating Your First Section

1. Go to `/admin` in your app
2. Click "New Section"
3. Fill in the details:
   - **Name**: My Hero Section
   - **Category**: Hero Sections
   - **Liquid Code**: Your section template
   - **Schema JSON**: Shopify section schema
   - **CSS/JS**: Optional styling and scripts
4. Mark as "Free" or set a price
5. Click "Create Section"

### Example Section Structure

**Liquid Code:**
```liquid
<div class="hero-section" style="background: {{ section.settings.bg_color }};">
  <h1>{{ section.settings.title }}</h1>
  <p>{{ section.settings.subtitle }}</p>
</div>
```

**Schema JSON:**
```json
{
  "name": "Hero Section",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Welcome"
    },
    {
      "type": "text",
      "id": "subtitle",
      "label": "Subtitle"
    },
    {
      "type": "color",
      "id": "bg_color",
      "label": "Background Color",
      "default": "#000000"
    }
  ]
}
```

## 🔐 Security Notes

- All Shopify requests are verified using HMAC signatures
- OAuth state parameter prevents CSRF attacks
- Supabase Row Level Security (RLS) is enabled
- Service role key is only used in API routes (server-side)
- Environment variables are never exposed to the client

## 🎯 Monetization Strategy

### Free Tier
- 20-30 basic sections
- Builds trust and showcases quality
- Drives app installations

### Paid Sections
- Premium, complex sections: $5-$20 each
- One-time payment (no subscriptions)
- Customers own the section forever

### Optional Premium Plan
- All-access monthly subscription
- Priority support
- Custom section requests

## 📈 Next Steps

### Phase 1 (Current MVP)
- ✅ Basic section library
- ✅ One-click installation
- ✅ Admin dashboard
- ✅ Category filtering

### Phase 2 (Growth)
- [ ] Payment integration (Stripe)
- [ ] Section ratings & reviews
- [ ] Preview in iframe before installation
- [ ] Version control for sections
- [ ] Bulk section installation

### Phase 3 (Scale)
- [ ] AI section generator
- [ ] A/B testing framework
- [ ] Analytics dashboard
- [ ] Affiliate program
- [ ] White-label solution

## 🐛 Troubleshooting

### Installation Fails
- Check if shop has granted proper permissions
- Verify theme ID is correct
- Ensure Liquid code is valid

### OAuth Errors
- Verify callback URL matches Shopify app settings
- Check HMAC signature verification
- Ensure API credentials are correct

### Database Issues
- Run schema.sql again if tables are missing
- Check RLS policies are properly configured
- Verify service role key has proper permissions

## 📞 Support

For questions or issues:
- Check the [Shopify App Development docs](https://shopify.dev/docs/apps)
- Review [Supabase documentation](https://supabase.com/docs)
- Open an issue on GitHub

## 📄 License

MIT License - feel free to use this for your own projects!

## 🙏 Acknowledgments

- Shopify for their excellent developer platform
- Supabase for the amazing backend-as-a-service
- Vercel for seamless deployment
- The Shopify app developer community

---

Built with ❤️ for SaaS founders
