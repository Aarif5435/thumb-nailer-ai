# YouTube API Setup Guide

## Quick Setup (5 minutes)

### 1. Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **YouTube Data API v3**:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### 2. Add to Environment

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Add your YouTube API key:
   ```bash
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

### 3. Test the Integration

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Generate a thumbnail - you should see logs like:
   ```
   Fetching YouTube reference thumbnails for topic: your topic
   Found 2 reference thumbnails
   ```

## How It Works

✅ **No More Qdrant Database Needed!**

Instead of storing thumbnails in a vector database, the app now:

1. **Fetches Live Data**: Uses YouTube API to find 2-3 successful thumbnails related to your topic
2. **Downloads References**: Gets the actual thumbnail images as base64 data
3. **Sends to AI**: Passes both your prompt AND the reference images to Gemini
4. **Creates Better Thumbnails**: AI learns from proven successful patterns

## Benefits

- ✅ **Always Fresh**: Gets current successful thumbnails
- ✅ **No Database**: Simpler setup, no Docker needed
- ✅ **Better Results**: AI sees actual successful examples
- ✅ **Faster**: Direct API calls vs database management
- ✅ **Proven CTR**: References real videos with view counts

## API Usage

The YouTube service automatically:
- Searches for relevant videos
- Filters for high-quality content (>1000 views)
- Downloads thumbnail images
- Provides context about video performance
- Handles errors gracefully (works without API key)

Perfect for creating high-CTR thumbnails! 🚀
