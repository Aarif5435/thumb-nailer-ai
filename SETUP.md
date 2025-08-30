# 🚀 Setup Instructions - Nano Banana AI Thumbnail Creator

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js 18+ installed
- [ ] pnpm package manager installed
- [ ] Google AI API key (Gemini)
- [ ] YouTube Data API v3 key
- [ ] OpenAI API key
- [ ] Qdrant database (local or cloud)

## Step-by-Step Setup

### 1. Environment Configuration

Create `.env.local` file in the root directory:

```bash
# Copy the example file
cp env.example .env.local
```

Fill in your API keys:

```env
# Google AI (Gemini) - Get from https://aistudio.google.com/
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# YouTube Data API v3 - Get from Google Cloud Console
YOUTUBE_API_KEY=your_youtube_api_key_here

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key_here

# OpenAI (for query rewriting) - Get from OpenAI Platform
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Qdrant Database

**Option A: Docker Compose (Recommended)**
```bash
# One-command setup
pnpm run db:setup

# Or manually
docker-compose up -d qdrant
```

**Option B: Docker (Manual)**
```bash
docker run -p 6333:6333 qdrant/qdrant
```

**Option C: Local Installation**
```bash
# macOS
brew install qdrant

# Ubuntu/Debian
curl -L https://github.com/qdrant/qdrant/releases/latest/download/qdrant-x86_64-unknown-linux-gnu.tar.gz | tar xz
./qdrant
```

**Database Management Commands:**
```bash
pnpm run db:start   # Start Qdrant
pnpm run db:stop    # Stop Qdrant  
pnpm run db:logs    # View logs
pnpm run db:reset   # Reset database (removes all data)
```

### 4. Initialize Database

```bash
# Start the Next.js development server
pnpm run dev

# In another terminal, initialize the database
curl -X POST http://localhost:3000/api/database/init
```

Expected response:
```json
{
  "message": "Vector database initialized successfully",
  "collectionInfo": {...}
}
```

### 5. Scrape Training Data (Optional but Recommended)

```bash
# Scrape all categories (takes 30-60 minutes)
pnpm run scrape

# Or scrape specific categories
pnpm run scrape technical entertainment gaming
```

This will populate your vector database with thousands of successful YouTube thumbnails for better AI generation.

### 6. Test the Application

Visit http://localhost:3000 and:

1. Enter a video topic (e.g., "React tutorial for beginners")
2. Optionally upload an image
3. Answer the 5 dynamic questions
4. Generate your thumbnail!

## API Key Setup Guides

### Google AI (Gemini) API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create a new API key
5. Copy and paste into `GOOGLE_AI_API_KEY`

### YouTube Data API v3 Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Go to Credentials → Create Credentials → API Key
5. Copy and paste into `YOUTUBE_API_KEY`

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or sign in
3. Go to API Keys section
4. Create new secret key
5. Copy and paste into `OPENAI_API_KEY`

### Qdrant Setup

**Local Setup:**
- Default URL: `http://localhost:6333`
- No API key needed for local

**Cloud Setup:**
1. Sign up at [Qdrant Cloud](https://cloud.qdrant.io/)
2. Create a cluster
3. Get your cluster URL and API key
4. Update `QDRANT_URL` and `QDRANT_API_KEY`

## Troubleshooting

### Common Issues

**1. "Cannot find module 'zod'" or similar import errors**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**2. Qdrant connection failed**
- Ensure Qdrant is running on the specified port
- Check firewall settings
- Verify URL and API key

**3. YouTube API quota exceeded**
- YouTube API has daily quotas
- Wait 24 hours or upgrade to paid plan
- Reduce scraping frequency

**4. Gemini rate limits**
- Gemini has rate limits on free tier
- Add delays between requests
- Consider upgrading to paid plan

**5. OpenAI API errors**
- Check API key validity
- Ensure sufficient credits
- Verify model access permissions

### Debug Mode

Enable detailed logging:
```bash
NODE_ENV=development pnpm run dev
```

### Health Check Endpoints

Test your setup:
```bash
# Check database connection
curl http://localhost:3000/api/database/init

# Test question generation
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{"topic":"React tutorial"}'

# Check scraping status
curl http://localhost:3000/api/scrape
```

## Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel dashboard.

### Other Platforms

Ensure your deployment platform supports:
- Node.js 18+
- File system access for image storage
- External database connections (Qdrant)

## Performance Optimization

### For Better Results

1. **Scrape More Data**: More training thumbnails = better results
2. **Category-Specific Scraping**: Focus on your content niche
3. **Regular Updates**: Refresh thumbnail database monthly
4. **A/B Testing**: Generate multiple variations and test

### Resource Management

- **Memory**: Large embeddings require sufficient RAM
- **Storage**: Generated thumbnails stored in `public/generated/`
- **API Limits**: Monitor usage across all APIs

## Support

If you encounter issues:

1. Check this setup guide
2. Review error logs in terminal
3. Verify all API keys are correct
4. Ensure all services are running
5. Check the troubleshooting section

## Next Steps

Once setup is complete:

1. Generate your first thumbnail
2. Experiment with different topics and styles  
3. Upload custom images for personalization
4. Explore the reference thumbnail system
5. Consider contributing improvements!

Happy thumbnail creating! 🎨✨
