# Quick Start Guide

Get your Section Store app running in 15 minutes!

## Prerequisites
- [ ] Node.js 18+ installed
- [ ] GitHub account
- [ ] Shopify Partner account
- [ ] Supabase account (free)
- [ ] Vercel account (free)

## Step 1: Database Setup (3 minutes)

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Copy schema.sql contents
# 3. Run in SQL Editor
# 4. Save these credentials:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

## Step 2: Shopify App Setup (3 minutes)

```bash
# 1. Go to https://partners.shopify.com
# 2. Create new app
# 3. Set URLs (update after deployment):
App URL: https://your-app.vercel.app
Redirect: https://your-app.vercel.app/api/auth/callback

# 4. Add scopes:
read_themes, write_themes, read_products, write_products

# 5. Save these credentials:
NEXT_PUBLIC_SHOPIFY_API_KEY=xxxxx
SHOPIFY_API_SECRET=xxxxx
```

## Step 3: Clone & Install (2 minutes)

```bash
# Clone this repository
git clone <your-repo-url>
cd section-store-mvp

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

## Step 4: Test Locally (2 minutes)

```bash
# Run development server
npm run dev

# Open browser
open http://localhost:3000

# Test admin panel
open http://localhost:3000/admin
```

## Step 5: Deploy to Vercel (5 minutes)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/section-store.git
git push -u origin main

# Deploy to Vercel
# 1. Go to https://vercel.com
# 2. Import GitHub repository
# 3. Add environment variables from .env.local
# 4. Click Deploy
# 5. Copy deployment URL
```

## Step 6: Update Shopify URLs

```bash
# Update in Shopify Partner Dashboard:
App URL: https://your-actual-url.vercel.app
Redirect: https://your-actual-url.vercel.app/api/auth/callback

# Update in Vercel environment variables:
SHOPIFY_APP_URL=https://your-actual-url.vercel.app

# Trigger redeployment in Vercel
```

## Step 7: Test Installation

```bash
# 1. Create development store in Shopify Partners
# 2. Install your app on the dev store
# 3. Authorize permissions
# 4. App should load successfully
```

## Step 8: Add Your First Section

```bash
# 1. Go to https://your-app.vercel.app/admin
# 2. Click "New Section"
# 3. Use example from EXAMPLE_SECTIONS.md
# 4. Copy/paste Liquid and Schema
# 5. Mark as "Free"
# 6. Save

# 7. Test installation:
#    - Go to main app view
#    - Click "Install Section"
#    - Check theme editor
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Deployment
vercel                  # Deploy to Vercel
vercel --prod          # Deploy to production

# Database
npm run supabase:generate-types  # Generate TypeScript types
```

## Project Structure

```
section-store-mvp/
├── app/
│   ├── admin/          # Admin dashboard
│   ├── api/            # API routes
│   ├── page.tsx        # Main app (merchant view)
│   └── layout.tsx      # Root layout
├── components/         # React components
├── lib/
│   ├── supabase.ts    # Database client
│   ├── shopify.ts     # Shopify utilities
│   └── database.types.ts
├── supabase/
│   └── schema.sql     # Database schema
├── public/            # Static assets
└── package.json
```

## What's Included

✅ **Complete Shopify app** with OAuth
✅ **Beautiful admin dashboard** for managing sections
✅ **Merchant-facing UI** to browse and install sections
✅ **Supabase integration** with full schema
✅ **API routes** for all operations
✅ **TypeScript** for type safety
✅ **Tailwind CSS** for styling
✅ **Ready for Vercel** deployment

## Next Steps

1. **Add Sections**: Create 20-30 quality sections
2. **Customize Design**: Update colors and branding
3. **Add Features**: Reviews, payments, analytics
4. **Marketing**: List on Shopify App Store
5. **Scale**: Add more features based on user feedback

## Need Help?

- 📖 Read [README.md](README.md) for detailed docs
- 🚀 Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide
- 💡 See [EXAMPLE_SECTIONS.md](EXAMPLE_SECTIONS.md) for section templates
- 🐛 Open GitHub issue for bugs
- 💬 Join Shopify Partners Slack

## Tips for Success

1. **Start Small**: Launch with 20-30 high-quality sections
2. **Free First**: Offer many free sections to build trust
3. **Quality Over Quantity**: One great section > ten mediocre ones
4. **Listen to Users**: Build what merchants actually need
5. **Iterate Fast**: Ship updates weekly
6. **Document Everything**: Clear instructions = happy users
7. **Test Thoroughly**: Test on multiple themes before launch

## Monetization Ideas

- **Freemium**: 20 free sections, charge for premium ones
- **One-time Payments**: $5-20 per premium section
- **Bundles**: Theme packages at $49-99
- **Subscription**: $15/month for all-access
- **Custom Requests**: $199+ for custom sections

## Success Metrics to Track

- Installation rate
- Section usage frequency
- Customer reviews/ratings
- Support ticket volume
- Revenue per user
- Churn rate
- Top-performing sections

---

🎉 **You're all set!** Start building amazing sections and grow your SaaS!

Remember: Focus on solving real merchant problems with high-quality sections.
