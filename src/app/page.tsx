'use client';

import { useState, useEffect } from 'react';
import { Question, UserAnswers, GeneratedThumbnail, ThumbnailData } from '@/lib/types';
import { QuestionForm } from '@/components/QuestionForm';
import { ImageUploadPage } from '@/components/ImageUploadPage';
import { ThumbnailResult } from '@/components/ThumbnailResult';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { AuthPage } from '@/components/AuthPage';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

// Main App Component
export default function App() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}

// Home Content Component
function HomeContent() {
  const { isDark } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'topic' | 'image' | 'questions' | 'result'>('home');
  const [topic, setTopic] = useState('');
  const [userImage, setUserImage] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<ThumbnailData | null>(null);
  const [loading, setLoading] = useState(false);

  const navigateTo = (page: 'home' | 'topic' | 'image' | 'questions' | 'result') => {
    setCurrentPage(page);
  };

  // Check authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const showAuth = localStorage.getItem('showAuth');
    const redirectToTopic = localStorage.getItem('redirectToTopic');
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      
      // If user was redirected to topic after login, go there
      if (redirectToTopic === 'true') {
        setCurrentPage('topic');
        localStorage.removeItem('redirectToTopic');
      }
    }
    
    if (showAuth === 'true') {
      setIsAuthenticated(false);
      localStorage.removeItem('showAuth');
    }
  }, []);

  const resetApp = () => {
    setCurrentPage('home');
    setTopic('');
    setUserImage('');
    setQuestions([]);
    setAnswers({});
    setResult(null);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('topic'); // Go directly to topic step after login
  };

  // Show auth page if not authenticated and trying to access protected features
  if (!isAuthenticated && currentPage !== 'home') {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const fetchQuestions = async (topicText: string) => {
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
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const generateThumbnail = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    
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
  
    
    try {
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
        setResult(data as ThumbnailData);
        navigateTo('result');
      }
    } catch (error) {
      console.error('Error generating thumbnail:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HeroSection onGetStarted={() => navigateTo('topic')} isAuthenticated={isAuthenticated} />;
      
      case 'topic':
        return (
          <TopicPage 
            topic={topic}
            setTopic={setTopic}
            onContinue={() => navigateTo('image')}
            onBack={() => navigateTo('home')}
          />
        );
      
      case 'image':
        return (
          <ImageUploadPage
            userImage={userImage}
            setUserImage={setUserImage}
            onContinue={() => fetchQuestions(topic)}
            onBack={() => navigateTo('topic')}
            topic={topic}
            isLoading={loading}
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
            onBack={() => navigateTo('topic')}
          />
        );
      
      case 'result':
        return result ? (
          <ResultPage
            result={result as ThumbnailData}
            onRegenerate={() => navigateTo('questions')}
            onStartOver={resetApp}
            userAnswers={answers}
          />
        ) : null;
      
      default:
        return <HeroSection onGetStarted={() => navigateTo('topic')} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
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
    </div>
  );
}

// Topic Page Component
function TopicPage({ 
  topic, 
  setTopic, 
  onContinue, 
  onBack 
}: {
  topic: string;
  setTopic: (topic: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12">
      <div className="max-w-4xl mx-auto w-full">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className={`mb-8 inline-flex items-center px-4 py-2 rounded-full ${
            isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50'
          } shadow-lg transition-all duration-200`}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Home
        </motion.button>

        {/* Main Content */}
        <div className="text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className={`inline-flex items-center px-6 py-3 rounded-full ${
              isDark 
                ? 'bg-white/10 border border-white/20' 
                : 'bg-red-50 border border-red-200'
            } backdrop-blur-sm`}>
              <Sparkles className="w-5 h-5 text-red-500 mr-3" />
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-red-600'}`}>
                Step 1: Tell us about your video
              </span>
            </div>

            <h1 className={`text-5xl md:text-7xl font-black leading-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              What's your video about?
            </h1>

            <p className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
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
                className={`relative rounded-3xl overflow-hidden ${
                  isDark ? 'bg-gray-800/50' : 'bg-white/80'
                } backdrop-blur-sm border-2 ${
                  topic.trim() 
                    ? 'border-red-500 shadow-2xl shadow-red-500/20' 
                    : isDark ? 'border-gray-600' : 'border-gray-300'
                } transition-all duration-300`}
                animate={topic.trim() ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., How to master React in 30 days, Best workout routine for beginners..."
                  className={`w-full px-8 py-6 text-xl bg-transparent ${
                    isDark ? 'text-black placeholder-gray-400' : 'text-black placeholder-gray-500'
                  } focus:outline-none`}
                  onKeyPress={(e) => e.key === 'Enter' && topic.trim() && onContinue()}
                  autoFocus
                />
                
                <div className={`absolute bottom-2 right-4 text-sm ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {topic.length}/100
                </div>
              </motion.div>
            </div>

            <motion.button
              onClick={onContinue}
              disabled={!topic.trim()}
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
  onBack
}: {
  questions: Question[];
  answers: { [key: string]: string };
  onAnswersChange: (answers: { [key: string]: string }) => void;
  onComplete: () => void;
  topic: string;
  onBack: () => void;
}) {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className={`mb-8 inline-flex items-center px-4 py-2 rounded-full ${
            isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50'
          } shadow-lg transition-all duration-200`}
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Topic
        </motion.button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-6xl font-black mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Let's Perfect Your Thumbnail
          </h1>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Answer a few questions to create the perfect thumbnail for "{topic}"
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
  userAnswers
}: {
  result: ThumbnailData;
  onRegenerate: () => void;
  onStartOver: () => void;
  userAnswers: { [key: string]: string };
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
        />
      </div>
    </div>
  );
}