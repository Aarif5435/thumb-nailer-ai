'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ThumbnailResult } from '@/components/ThumbnailResult';
import { Header } from '@/components/Header';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ThumbnailData } from '@/lib/types';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<ThumbnailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/result/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setResult(data.result);
        } else {
          setError('Result not found');
        }
      } catch (error) {
        setError('Failed to load result');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchResult();
    }
  }, [params.id]);

  const handleRegenerate = async () => {
    if (!result) return;
    
    try {
      // Check if user has regenerate credits
      const response = await fetch('/api/use-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' }),
      });

      const creditData = await response.json();
      if (!creditData.success) {
        // Show paywall or redirect to payment
        router.push('/?showPaywall=true');
        return;
      }

      // Get user image from result data
      let userImage = null;
      if ((result.userAnswers as any)?.userImage) {
        userImage = (result.userAnswers as any).userImage;
      }

      // Create a regenerate session and redirect to questions
      await fetch('/api/regenerate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: result.topic,
          originalThumbnailId: params.id,
          userImage
        }),
      });

      // Redirect to main app with regenerate session and source parameter
      router.push('/?from=result');
    } catch (error) {
      // Regeneration setup failed
    }
  };

  const handleStartOver = () => {
    router.push('/');
  };

  const handleShowPaywall = () => {
    router.push('/?showPaywall=true');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header currentPage="result" onReset={handleStartOver} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Result Not Found</h1>
            <p className="text-muted-foreground mb-6">The thumbnail result you're looking for doesn't exist.</p>
            <button
              onClick={handleStartOver}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
            >
              Create New Thumbnail
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header currentPage="result" onReset={handleStartOver} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <ThumbnailResult
            thumbnail={result.thumbnail as any}
            similarThumbnails={result.similarThumbnails as any}
            enhancedQuery={result.enhancedQuery as any}
            userAnswers={result.userAnswers as any}
            onRegenerate={handleRegenerate}
            onStartOver={handleStartOver}
            onShowPaywall={handleShowPaywall}
          />
        </div>
      </div>
    </div>
  );
}
