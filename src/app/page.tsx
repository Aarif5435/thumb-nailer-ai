'use client';

import { useState, useEffect } from 'react';
import { Question, UserAnswers, GeneratedThumbnail, ThumbnailData } from '@/lib/types';
import { QuestionForm } from '@/components/QuestionForm';
import { ImageUploadPage } from '@/components/ImageUploadPage';
import { ThumbnailResult } from '@/components/ThumbnailResult';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { LoadingScreen } from '@/components/LoadingScreen';
import { UserCredits } from '@/components/UserCredits';

import { useUser, SignInButton } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Lock } from 'lucide-react';

// Main App Component
export default function App() {
  return <HomeContent />;
}

// Home Content Component
function HomeContent() {
  const { user, isLoaded } = useUser();
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'topic' | 'image' | 'questions' | 'result'>('home');
  const [topic, setTopic] = useState('');
  const [userImage, setUserImage] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<ThumbnailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isRegenerateSession, setIsRegenerateSession] = useState(false);
  const [regenerateSource, setRegenerateSource] = useState<'profile' | 'result' | null>(null);

  const navigateTo = (page: 'home' | 'topic' | 'image' | 'questions' | 'result') => {
    // During regenerate session, restrict navigation to first steps
    if (isRegenerateSession && (page === 'topic' || page === 'image')) {
      return; // Don't allow navigation to topic or image steps during regenerate
    }
    setCurrentPage(page);
  };

  const resetApp = () => {
    setCurrentPage('home');
    setTopic('');
    setUserImage('');
    setQuestions([]);
    setAnswers({});
    setResult(null);
    setIsRegenerateSession(false);
    setRegenerateSource(null);
  };

  const cancelRegenerate = () => {
    // Clear the regenerate session
    fetch('/api/regenerate-session', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    // Redirect back to where user came from
    if (regenerateSource === 'profile') {
      window.location.href = '/profile';
    } else if (regenerateSource === 'result') {
      // Go back to the previous page (result page)
      window.history.back();
    } else {
      // Default to home page
      resetApp();
    }
  };

  // Check for regenerate session on component mount
  useEffect(() => {
    const checkRegenerateSession = async () => {
      try {
        const response = await fetch('/api/regenerate-session');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.topic) {
            setTopic(data.topic);
            setIsRegenerateSession(true); // Mark as regenerate session
            
            // Detect where user came from based on URL or referrer
            const urlParams = new URLSearchParams(window.location.search);
            const source = urlParams.get('from') as 'profile' | 'result' | null;
            setRegenerateSource(source);
            
            // Set the user image from regenerate session if available
            if (data.userImage) {
              setUserImage(data.userImage);
            }
            setLoadingQuestions(true); // Show loading while fetching questions
            // Fetch questions for the regenerate session
            await fetchQuestions(data.topic);
            // Don't delete the session here - let the flash_img API delete it after deducting credits
          }
        }
      } catch (error) {
        // Silent: regenerate session check failed
      }
    };

    if (user) {
      checkRegenerateSession();
    }
  }, [user]);

  // Show loading while Clerk is loading or while fetching questions for regenerate
  if (!isLoaded || loadingQuestions) {
    return <LoadingScreen />;
  }

  const fetchQuestions = async (topicText: string) => {
    setLoadingQuestions(true);
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicText }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
        setAnswers({});
        navigateTo('questions');
      }
    } catch (error) {}
    setLoadingQuestions(false);
  };

  const generateThumbnail = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    
    try {
      // First, check if user can generate (free preview or has credits)
      const checkResponse = await fetch('/api/check-free-preview');
      const checkData = await checkResponse.json();
      if (!checkData.canGenerate) {
        // No free preview or credits available, show paywall
        setShowPaywall(true);
        setLoading(false);
        return;
      }

      // Debug: Log what's being sent
      const userAnswersData = {
        topic,
        targetAudience: answers.targetAudience || 'general',
        contentType: 'video',
        emotion: answers.emotion || 'excited',
        keyElements: answers.keyElements || 'engaging visuals',
        stylePreference: answers.stylePreference || 'modern',
        additionalAnswers: answers
      };
    
      const response = await fetch('/api/flash_img', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswers: userAnswersData,
          userImage,
          variations: 1
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Mark free preview as used if this was a free preview
        if (checkData.credits && !checkData.credits.hasUsedFreePreview && !checkData.credits.isAdmin) {
          await fetch('/api/use-free-preview', { method: 'POST' });
        }
        
        // Redirect to the result page with the unique ID
        if (data.id) {
          window.location.href = `/result/${data.id}`;
        } else {
          // Fallback to inline result if no ID
          setResult(data as ThumbnailData);
          navigateTo('result');
        }
      }
    } catch (error) {
      // Generation failed
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      // Regeneration always requires credits (no free preview for regeneration)
      const creditResponse = await fetch('/api/use-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'regenerate' }),
      });

      const creditData = await creditResponse.json();

      if (!creditData.success) {
        // No credits available, show paywall
        setShowPaywall(true);
        return;
      }

      // Proceed with regeneration
      await generateThumbnail();
    } catch (error) {}
  };

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HeroSection onGetStarted={() => navigateTo('topic')} isAuthenticated={!!user} />;
      
      case 'topic':
        return user ? (
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-4xl mx-auto">
              <UserCredits />
              <div className="mt-6">
                <TopicPage 
                  topic={topic}
                  setTopic={setTopic}
                  onContinue={() => navigateTo('image')}
                  onBack={isRegenerateSession ? cancelRegenerate : () => navigateTo('home')}
                  isRegenerateSession={isRegenerateSession}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-4 text-gray-900">
                  Authentication Required
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Please sign in to create thumbnails
                </p>
              </div>
              
              <div className="space-y-4">
                <SignInButton>
                  <motion.button
                    className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign In to Continue
                  </motion.button>
                </SignInButton>
                
                <motion.button
                  onClick={isRegenerateSession ? cancelRegenerate : () => navigateTo('home')}
                  className="w-full px-8 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isRegenerateSession ? 'Cancel Regenerate' : 'Back to Home'}
                </motion.button>
              </div>
            </div>
          </div>
        );
      
      case 'image':
        return (
          <ImageUploadPage
            userImage={userImage}
            setUserImage={setUserImage}
            onContinue={() => fetchQuestions(topic)}
            loadingQuestions={loadingQuestions}
            onBack={isRegenerateSession ? cancelRegenerate : () => navigateTo('topic')}
            topic={topic}
            isLoading={loading}
            isRegenerateSession={isRegenerateSession}
          />
        );
      
      case 'questions':
        return (
          <QuestionsPage
            questions={questions}
            answers={answers}
            onAnswersChange={setAnswers}
            onComplete={generateThumbnail}
            topic={topic}
            onBack={isRegenerateSession ? cancelRegenerate : () => navigateTo('topic')}
            isRegenerateSession={isRegenerateSession}
          />
        );
      
      case 'result':
        return result ? (
          <ResultPage
            result={result as ThumbnailData}
            onRegenerate={handleRegenerate}
            onStartOver={resetApp}
            userAnswers={answers}
            onShowPaywall={() => setShowPaywall(true)}
          />
        ) : null;
      
      default:
        return <HeroSection onGetStarted={() => navigateTo('topic')} />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500 bg-background text-foreground">
      <Header currentPage={currentPage} onReset={resetApp} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {renderCurrentPage()}
        </motion.div>
      </AnimatePresence>

              {loading && <LoadingScreen />}



        {/* Enhanced Paywall Modal */}
        {showPaywall && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Credits Required!</h3>
                <p className="text-slate-600">
                  You've used your free preview. Purchase credits to download, regenerate, or create more thumbnails!
                </p>
              </div>
              
              {/* Package Details */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border border-orange-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">₹59</div>
                  <div className="text-sm text-slate-600 mb-2">Special Package Deal</div>
                  <div className="space-y-1 text-sm text-slate-700">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>3 New Thumbnails</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>5 Regenerates</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPaywall(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/create-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          amount: 59, // ₹59 in rupees
                          currency: 'INR',
                          package: '3_thumbnails_5_regenerates'
                        })
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        
                        // Load Razorpay script
                        const script = document.createElement('script');
                        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                        script.onload = () => {
                          const options = {
                            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                            amount: data.amount,
                            currency: data.currency,
                            name: 'Thumb-nailer',
                            description: '3 Thumbnails + 5 Regenerates',
                            order_id: data.id,
                            image: '/favicon.ico',
                            callback_url: `${window.location.origin}/api/verify-payment`,
                            prefill: {
                              name: user?.fullName || '',
                              email: user?.primaryEmailAddress?.emailAddress || '',
                            },
                            theme: {
                              color: '#ff6b35'
                            }
                          };
                          
                          const rzp = new (window as any).Razorpay(options);
                          rzp.open();
                          setShowPaywall(false);
                        };
                        document.head.appendChild(script);
                      }
                    } catch (error) {
                      alert('Failed to initiate payment. Please try again.');
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Buy Now - ₹59
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

// Topic Page Component
function TopicPage({ 
  topic, 
  setTopic, 
  onContinue, 
  onBack,
  isRegenerateSession
}: {
  topic: string;
  setTopic: (topic: string) => void;
  onContinue: () => void;
  onBack: () => void;
  isRegenerateSession: boolean;
}) {

  return (
    <div className="min-h-screen flex flex-col justify-start px-6 py-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-card text-card-foreground hover:bg-accent shadow-lg transition-all duration-200 border border-border"
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          ← {isRegenerateSession ? 'Cancel Regenerate' : 'Back to Home'}
        </motion.button>

        {/* Main Content */}
        <div className="text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-accent border border-border backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-primary mr-3" />
              <span className="font-semibold text-accent-foreground">
                Step 1: Tell us about your video
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-tight text-foreground">
              What's your video about?
            </h1>

            <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-muted-foreground">
              Describe your video topic and I'll create the perfect thumbnail for you
            </p>
          </motion.div>

          {/* Topic Input */}
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="relative">
              <motion.div
                className={`relative rounded-3xl overflow-hidden bg-card backdrop-blur-sm border-2 ${
                  topic.trim() 
                    ? 'border-primary shadow-2xl shadow-primary/20' 
                    : 'border-border'
                } transition-all duration-300`}
                animate={topic.trim() ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., How to master React in 30 days, Best workout routine for beginners..."
                  className="w-full px-8 py-6 text-xl bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && topic.trim() && onContinue()}
                  autoFocus
                />
                
                <div className="absolute bottom-2 right-4 text-sm text-muted-foreground">
                  {topic.length}/100
                </div>
              </motion.div>
            </div>

            <motion.button
              onClick={onContinue}
              disabled={!topic.trim()}
              // loading={true}
              className="mt-8 px-12 py-6 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-xl rounded-3xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              whileHover={{ scale: topic.trim() ? 1.05 : 1, y: topic.trim() ? -3 : 0 }}
              whileTap={{ scale: topic.trim() ? 0.95 : 1 }}
            >
              Continue to Questions
              <ArrowRight className="w-6 h-6 ml-3 inline" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Questions Page Component
function QuestionsPage({
  questions,
  answers,
  onAnswersChange,
  onComplete,
  topic,
  onBack,
  isRegenerateSession
}: {
  questions: Question[];
  answers: { [key: string]: string };
  onAnswersChange: (answers: { [key: string]: string }) => void;
  onComplete: () => void;
  topic: string;
  onBack: () => void;
  isRegenerateSession: boolean;
}) {

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="mb-6 inline-flex items-center px-4 py-2 rounded-full bg-card text-card-foreground hover:bg-accent shadow-lg transition-all duration-200 border border-border"
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          ← {isRegenerateSession ? 'Cancel Regenerate' : 'Back to Topic'}
        </motion.button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-foreground">
            {isRegenerateSession ? 'Let\'s Improve Your Thumbnail' : 'Let\'s Perfect Your Thumbnail'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {isRegenerateSession 
              ? `Answer a few questions to improve your thumbnail for "${topic}"`
              : `Answer a few questions to create the perfect thumbnail for "${topic}"`
            }
          </p>
        </div>

        {/* Question Form */}
        <QuestionForm
          questions={questions}
          answers={answers}
          onAnswersChange={onAnswersChange}
          onComplete={onComplete}
          topic={topic}
        />
      </div>
    </div>
  );
}

// Result Page Component
function ResultPage({
  result,
  onRegenerate,
  onStartOver,
  userAnswers,
  onShowPaywall
}: {
  result: ThumbnailData;
  onRegenerate: () => void;
  onStartOver: () => void;
  userAnswers: { [key: string]: string };
  onShowPaywall?: () => void;
}) {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <ThumbnailResult
          thumbnail={result.thumbnail as GeneratedThumbnail}
          similarThumbnails={result.similarThumbnails as ThumbnailData[]}
          enhancedQuery={result.enhancedQuery as string | undefined}
          userAnswers={{
            topic: userAnswers.topic || '',
            targetAudience: userAnswers.targetAudience || '',
            contentType: userAnswers.contentType || '',
            emotion: userAnswers.emotion || '',
            keyElements: userAnswers.keyElements || '',
            stylePreference: userAnswers.stylePreference || '',
            additionalAnswers: userAnswers
          }}
          onRegenerate={onRegenerate}
          onStartOver={onStartOver}
          onShowPaywall={onShowPaywall}
        />
      </div>
    </div>
  );
}