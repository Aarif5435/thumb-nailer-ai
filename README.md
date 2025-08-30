# Nano Banana - YouTube Thumbnail AI Creator

An intelligent AI agent that creates high-CTR YouTube thumbnails using Gemini 2.5 Flash Image Preview, powered by vector database search and dynamic questioning system.

## 🚀 Features

- **AI-Powered Generation**: Uses Gemini 2.5 Flash Image Preview for thumbnail creation
- **Smart Questioning**: Dynamic 5-question system that adapts based on content category
- **Vector Database**: Stores and searches through thousands of successful YouTube thumbnails
- **Query Rewriting**: LLM-enhanced search queries for better thumbnail matching
- **Multiple Categories**: Supports technical, entertainment, gaming, lifestyle, education, and music content
- **Image Upload**: Optional user image integration into thumbnails
- **Beautiful UI**: Modern, responsive interface with smooth animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Node.js
- **AI Models**: 
  - Gemini 2.5 Flash Image Preview (thumbnail generation)
  - OpenAI GPT-4 (query rewriting and analysis)
  - OpenAI Embeddings (vector search)
- **Database**: Qdrant Vector Database
- **APIs**: YouTube Data API v3
- **UI Components**: Lucide React icons, React Dropzone

## 📋 Prerequisites

Before running this project, you'll need:

1. **API Keys**:
   - Google AI API key (for Gemini)
   - YouTube Data API v3 key
   - OpenAI API key
   - Qdrant API key (or local Qdrant instance)

2. **Qdrant Database**:
   - Local installation or cloud instance
   - Default: http://localhost:6333

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd youtube-thumbnail-ai
pnpm install
```

### 2. Environment Setup

Copy `env.example` to `.env.local` and fill in your API keys:

```bash
cp env.example .env.local
```

```env
# Google AI (Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key_here

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key_here

# OpenAI (for query rewriting)
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Qdrant Database

**Option A: Docker (Recommended)**
```bash
docker run -p 6333:6333 qdrant/qdrant
```

**Option B: Local Installation**
Follow [Qdrant installation guide](https://qdrant.tech/documentation/quick-start/)

### 4. Initialize Database

```bash
# Initialize vector database collection
curl -X POST http://localhost:3000/api/database/init
```

### 5. Scrape Training Data

```bash
# Scrape all categories (may take 30-60 minutes)
pnpm run scrape

# Or scrape specific categories
pnpm run scrape technical gaming entertainment
```

### 6. Start Development Server

```bash
pnpm run dev
```

Visit http://localhost:3000 to use the application!

## 📱 How It Works

### 1. Topic Analysis
- User enters their video topic
- System detects content category (technical, entertainment, etc.)
- Generates category-specific questions

### 2. Dynamic Questioning
- **Core Questions**: Target audience, content type, emotion, key elements, style
- **Category-Specific**: Additional questions based on detected category
- **Adaptive Logic**: Questions change based on topic keywords

### 3. Vector Search
- User answers are processed by query rewriter LLM
- Enhanced query searches vector database of successful thumbnails
- Returns top 5 most similar thumbnails as references

### 4. AI Generation
- Gemini 2.5 Flash Image Preview generates thumbnail
- Uses reference thumbnails for style inspiration
- Incorporates user image if provided
- Optimized prompts for high-CTR results

## 🎯 Question Categories

### Technical Content
- Difficulty level (Beginner/Intermediate/Advanced)
- Technology/language specification
- Tutorial vs. review focus

### Entertainment
- Entertainment type (Comedy/Drama/Action)
- Mood and tone preferences
- Character/element highlights

### Gaming
- Game genre and platform
- Content type (Gameplay/Review/Tips)
- Gaming-specific visual elements

### Lifestyle
- Lifestyle category (Health/Food/Travel)
- Primary goal (Inspire/Educate/Entertain)
- Target demographic refinement

## 🔧 API Endpoints

### Core Endpoints
- `POST /api/questions` - Get dynamic questions for topic
- `POST /api/flash_img` - Generate thumbnail
- `POST /api/database/init` - Initialize vector database
- `POST /api/scrape` - Scrape YouTube thumbnails

### Example Usage

```javascript
// Get questions for topic
const response = await fetch('/api/questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'React tutorial for beginners' })
});

// Generate thumbnail
const response = await fetch('/api/flash_img', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userAnswers: {
      topic: 'React tutorial for beginners',
      targetAudience: 'Adults',
      contentType: 'Tutorial/How-to',
      emotion: 'Trust',
      keyElements: 'Text overlay',
      stylePreference: 'Professional/Corporate'
    },
    userImage: 'base64_image_string', // optional
    variations: 1
  })
});
```

## 📊 Database Schema

### Thumbnail Data Structure
```typescript
interface ThumbnailData {
  id: string;
  thumbnailUrl: string;
  title: string;
  channel: string;
  category: 'entertainment' | 'technical' | 'gaming' | 'lifestyle' | 'education' | 'music';
  subcategory: string;
  views: number;
  visualElements: string[];
  colorPalette: string[];
  textElements: string[];
  layoutType: 'split_screen' | 'full_face' | 'product_focus' | 'text_heavy' | 'minimal';
  emotion: 'excitement' | 'curiosity' | 'urgency' | 'trust' | 'fun' | 'professional';
  targetAudience: 'kids' | 'teens' | 'adults' | 'professionals';
  performanceScore: number;
  description: string;
}
```

## 🎨 Customization

### Adding New Categories
1. Update `config.ts` scraping categories
2. Add category keywords in `questions.ts`
3. Update search queries in `youtube-scraper.ts`
4. Add category-specific questions

### Modifying Questions
Edit `src/lib/questions.ts` to:
- Add new base questions
- Create category-specific question sets
- Modify question logic and validation

### Enhancing Prompts
Update `src/lib/thumbnail-generator.ts` to:
- Modify system instructions
- Add new prompt templates
- Enhance generation parameters

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Set all environment variables in your deployment platform:
- `GOOGLE_AI_API_KEY`
- `YOUTUBE_API_KEY`
- `QDRANT_URL`
- `QDRANT_API_KEY`
- `OPENAI_API_KEY`

### Database Setup
Ensure Qdrant is accessible from your deployment environment and run the initialization endpoint.

## 🔍 Troubleshooting

### Common Issues

1. **Rate Limits**: YouTube API and Gemini have rate limits. Implement delays between requests.

2. **Vector Database Connection**: Ensure Qdrant is running and accessible.

3. **API Key Issues**: Verify all API keys are valid and have necessary permissions.

4. **Memory Issues**: Large batch operations may require memory optimization.

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Google AI for Gemini 2.5 Flash Image Preview
- OpenAI for GPT-4 and embeddings
- Qdrant for vector database technology
- YouTube for providing the data API
- Next.js team for the excellent framework

---

**Built with ❤️ by the Nano Banana team**