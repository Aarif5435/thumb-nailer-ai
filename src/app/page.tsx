'use client';

import { useState } from 'react';
import { Question, UserAnswers, GeneratedThumbnail, ThumbnailData } from '@/lib/types';
import { QuestionForm } from '@/components/QuestionForm';
import { ImageUpload } from '@/components/ImageUpload';
import { ThumbnailResult } from '@/components/ThumbnailResult';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Upload, MessageSquare, Sparkles } from 'lucide-react';

type Step = 'hero' | 'topic' | 'image' | 'questions' | 'result';

function HomeContent() {
  const { isDark } = useTheme();
  const [step, setStep] = useState<Step>('hero');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userImage, setUserImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<{
    thumbnail: GeneratedThumbnail;
    similarThumbnails: ThumbnailData[];
  } | null>(null);

  const fetchQuestions = async (topicInput: string) => {
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicInput }),
      });

      if (!response.ok) throw new Error('Failed to fetch questions');

      const data = await response.json();
      setQuestions(data.questions);
      setStep('questions');
    } catch (error) {
      console.error('Error getting questions:', error);
    }
  };

  const generateThumbnail = async () => {
    setLoading(true);
    try {
      const userAnswers: UserAnswers = {
        topic,
        targetAudience: answers.targetAudience || '',
        contentType: 'video',
        emotion: answers.emotion || '',
        keyElements: 'engaging visuals',
        stylePreference: answers.stylePreference || '',
        additionalAnswers: answers,
      };

      const response = await fetch('/api/flash_img', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswers,
          userImage: userImage || undefined,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setResult(data);
      setStep('result');
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetApp = () => {
    setStep('hero');
    setTopic('');
    setQuestions([]);
    setAnswers({});
    setUserImage('');
    setResult(null);
  };

  const handleGetStarted = () => {
    setStep('topic');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <AnimatePresence mode="wait">
        {step === 'hero' && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <HeroSection onGetStarted={handleGetStarted} />
          </motion.div>
        )}

        {step !== 'hero' && (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Header currentStep={step} onReset={resetApp} />
            
            <main className="relative z-10 px-6 pt-8">
              <div className="max-w-4xl mx-auto">
                {step === 'topic' && (
                  <motion.div
                    className="text-center space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Topic Input Section */}
                    <div className="space-y-6">
                      <motion.div
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-full"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Sparkles className="w-4 h-4 text-red-500 mr-2" />
                        <span className={`text-sm font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                          Step 1: Tell us your video topic
                        </span>
                      </motion.div>

                      <motion.h1
                        className={`text-4xl md:text-6xl font-black ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        What's your video about?
                      </motion.h1>

                      <motion.p
                        className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        Describe your video topic and we'll create a high-CTR thumbnail that gets clicks!
                      </motion.p>
                    </div>

                    <motion.div
                      className="max-w-2xl mx-auto space-y-6"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="relative">
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g., How to learn JavaScript in 30 days"
                          className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:scale-105 ${
                            isDark
                              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500'
                              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-red-500'
                          } shadow-lg focus:shadow-xl`}
                          onKeyPress={(e) => e.key === 'Enter' && topic.trim() && fetchQuestions(topic)}
                        />
                      </div>

                      <motion.button
                        onClick={() => topic.trim() && fetchQuestions(topic)}
                        disabled={!topic.trim()}
                        className="group w-full py-4 px-8 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        whileHover={{ scale: topic.trim() ? 1.02 : 1, y: topic.trim() ? -2 : 0 }}
                        whileTap={{ scale: topic.trim() ? 0.98 : 1 }}
                      >
                        <span className="flex items-center justify-center">
                          Continue to Questions
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </span>
                      </motion.button>
                    </motion.div>

                    {/* Optional Image Upload */}
                    <motion.div
                      className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <div className="space-y-4">
                        <div className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                          <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Optional: Upload an image
                          </span>
                        </div>
                        <ImageUpload
                          onImageUpload={setUserImage}
                          onImageRemove={() => setUserImage('')}
                          uploadedImage={userImage}
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {step === 'questions' && (
                  <QuestionForm
                    questions={questions}
                    answers={answers}
                    onAnswersChange={setAnswers}
                    onComplete={generateThumbnail}
                    topic={topic}
                  />
                )}

                {step === 'result' && result && (
                  <ThumbnailResult
                    thumbnail={result.thumbnail}
                    similarThumbnails={result.similarThumbnails}
                    onRegenerate={generateThumbnail}
                  />
                )}
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}