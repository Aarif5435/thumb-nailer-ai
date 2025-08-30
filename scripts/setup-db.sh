#!/bin/bash

# Nano Banana - Database Setup Script
echo "🍌 Setting up Nano Banana Vector Database..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Start Qdrant with Docker Compose
echo "🚀 Starting Qdrant vector database..."

if command -v docker-compose &> /dev/null; then
    docker-compose up -d qdrant
else
    docker compose up -d qdrant
fi

# Wait for Qdrant to be ready
echo "⏳ Waiting for Qdrant to be ready..."
sleep 10

# Check if Qdrant is running
if curl -f http://localhost:6333/health &> /dev/null; then
    echo "✅ Qdrant is running successfully!"
    echo "📊 Qdrant Web UI: http://localhost:6333/dashboard"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Set up your environment variables (.env.local)"
    echo "2. Start your Next.js app: pnpm run dev"
    echo "3. Initialize the database: curl -X POST http://localhost:3000/api/database/init"
    echo "4. (Optional) Scrape training data: pnpm run scrape"
else
    echo "❌ Qdrant failed to start. Please check Docker logs:"
    echo "   docker-compose logs qdrant"
fi
