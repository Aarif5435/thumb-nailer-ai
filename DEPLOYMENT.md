# Deployment Guide for Thumb-nailer

## Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres, Supabase, or PlanetScale)
- All API keys ready

## Step 1: Export Current Data

First, export your current SQLite data:

```bash
# Make sure you're in the project directory
cd /path/to/your/thumbnail/project

# Export current data
npx tsx scripts/export-data.ts
```

This will create a `data-export.json` file with all your current data.

## Step 2: Set Up Production Database

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Create a new project or go to existing project
3. Go to Storage tab
4. Create a new Postgres database
5. Copy the connection string

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

### Option C: PlanetScale
1. Go to [planetscale.com](https://planetscale.com)
2. Create a new database
3. Copy the connection string

## Step 3: Deploy to Vercel

### Method 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add CLERK_SECRET_KEY
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add GOOGLE_GENAI_API_KEY
vercel env add OPENAI_API_KEY
vercel env add YOUTUBE_API_KEY
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET
```

### Method 2: GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## Step 4: Set Environment Variables

In your Vercel dashboard, add these environment variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
OPENAI_API_KEY=your_openai_api_key
YOUTUBE_API_KEY=your_youtube_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Step 5: Run Database Migration

After deployment, run the database migration:

```bash
# Connect to your production database
npx prisma migrate deploy

# Or if using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

## Step 6: Import Your Data

```bash
# Import your exported data
npx tsx scripts/import-data.ts
```

## Step 7: Verify Deployment

1. Check your Vercel deployment URL
2. Test user registration/login
3. Test thumbnail generation
4. Check admin panel functionality
5. Verify payment integration

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database allows connections from Vercel IPs
- Ensure SSL is enabled if required

### API Key Issues
- Verify all environment variables are set
- Check API key permissions and quotas
- Test API keys individually

### Build Issues
- Check if all dependencies are in package.json
- Verify TypeScript compilation
- Check for missing environment variables

## Post-Deployment Checklist

- [ ] Database migration completed
- [ ] Data imported successfully
- [ ] User authentication working
- [ ] Thumbnail generation working
- [ ] Admin panel accessible
- [ ] Payment integration working
- [ ] All API endpoints responding
- [ ] Environment variables secure

## Rollback Plan

If something goes wrong:
1. Keep your local SQLite database as backup
2. Use Vercel's rollback feature
3. Re-import data if needed
4. Check Vercel function logs for errors
