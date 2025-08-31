'use client';

import { useState } from 'react';
import { Question, UserAnswers } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle, Circle, Zap } from 'lucide-react';

interface QuestionFormProps {
  questions: Question[];
  answers: { [key: string]: string };
  onAnswersChange: (answers: { [key: string]: string }) => void;
  onComplete: () => void;
  topic: string;
}

export function QuestionForm({ questions, answers, onAnswersChange, onComplete, topic }: QuestionFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const handleAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    onAnswersChange(newAnswers);
  };

  // Get current questions including conditional ones
  const getCurrentQuestions = () => {
    const baseQuestions = [...questions];
    
    // Add conditional custom text question if user selected custom text
    if (answers.thumbnailText === "Custom text (I'll specify)") {
      const customTextQuestion: Question = {
        id: 'customText',
        question: 'What text should appear on your thumbnail?',
        type: 'text',
        required: true,
      };
      
      // Insert after text overlay question
      const textOverlayIndex = baseQuestions.findIndex(q => q.id === 'thumbnailText');
      if (textOverlayIndex !== -1) {
        baseQuestions.splice(textOverlayIndex + 1, 0, customTextQuestion);
      }
    }
    
    // Add conditional logo text question if user wants a custom logo
    if (answers.logoPreference && !answers.logoPreference.includes('No logo') && !answers.logoPreference.includes('Generic') && !answers.logoPreference.includes('icon')) {
      const logoTextQuestion: Question = {
        id: 'logoText',
        question: 'What should your logo/brand text say?',
        type: 'text',
        required: true,
      };
      
      // Add at the end
      baseQuestions.push(logoTextQuestion);
    }
    
    return baseQuestions;
  };

  const currentQuestions = getCurrentQuestions();

  const handleNext = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Submit form
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const currentQ = currentQuestions[currentQuestion];
  const currentAnswer = answers[currentQ?.id];
  const canProceed = !currentQ?.required || currentAnswer;
  const progress = ((currentQuestion + 1) / currentQuestions.length) * 100;

  // Debug: Log current question structure
  console.log('Current question:', currentQ);
  console.log('Question type:', currentQ?.type);
  console.log('Question options:', currentQ?.options);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Enhanced Progress Bar */}
      <motion.div 
        className="mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center text-sm font-medium mb-4">
          <span className="text-gray-600">Question {currentQuestion + 1} of {currentQuestions.length}</span>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="gradient-text font-semibold">{Math.round(progress)}% Complete</span>
          </div>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200/50 rounded-full h-3 backdrop-blur-sm">
            <motion.div
              className="progress-glow h-3 rounded-full relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="absolute inset-0 shimmer" />
            </motion.div>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-between absolute -top-1 w-full">
            {currentQuestions.map((_, index) => (
              <motion.div
                key={index}
                className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                  index <= currentQuestion
                    ? 'bg-blue-500 border-blue-500 shadow-lg'
                    : 'bg-white border-gray-300'
                }`}
                whileHover={{ scale: 1.2 }}
                animate={index === currentQuestion ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {index < currentQuestion && (
                  <CheckCircle className="w-3 h-3 text-white m-0.5" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          exit={{ opacity: 0, x: -50, rotateY: 15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          {/* Background decoration */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl" />
          
          <div className="relative glass rounded-3xl p-8 border border-white/30 shadow-2xl">
            {/* Question header */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{currentQuestion + 1}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3 leading-tight">
                    {currentQ?.question}
                  </h2>
                  {currentQ?.required && (
                    <div className="flex items-center space-x-2">
                      <Circle className="w-3 h-3 text-red-400 fill-current" />
                      <p className="text-sm text-gray-600 font-medium">Required question</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Question content */}
            <div className="space-y-4">
              {currentQ?.type === 'single' && currentQ.options && (
                <div className="grid gap-3">
                  {currentQ.options.map((option, index) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                      onClick={() => handleAnswer(currentQ.id, option)}
                      onMouseEnter={() => setHoveredOption(option)}
                      onMouseLeave={() => setHoveredOption(null)}
                      className={`group relative p-5 text-left rounded-2xl border-2 transition-all duration-300 transform ${
                        currentAnswer === option
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 scale-[1.02] shadow-lg'
                          : 'border-gray-200/50 bg-white/80 text-gray-700 hover:border-blue-300 hover:bg-white hover:scale-[1.01] hover:shadow-md'
                      }`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Background glow effect */}
                      {(currentAnswer === option || hoveredOption === option) && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        currentAnswer === option
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300 group-hover:border-orange-400'
                      }`}>
                        {currentAnswer === option && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-3 h-3 bg-white rounded-full"
                          />
                        )}
                      </div>
                          <span className="font-medium text-lg leading-relaxed">{option}</span>
                        </div>
                        
                        {currentAnswer === option && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="text-orange-500"
                          >
                            <CheckCircle className="w-6 h-6" />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {currentQ?.type === 'text' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="relative"
                >
                  <textarea
                    value={currentAnswer || ''}
                    onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                    placeholder="Share your thoughts here..."
                    className="w-full p-6 border-2 border-gray-200/50 rounded-2xl focus:border-orange-500 focus:outline-none resize-none bg-white/80 backdrop-blur-sm text-lg leading-relaxed transition-all duration-300 focus:shadow-lg text-black"
                    rows={4}
                  />
                  <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                    {(currentAnswer || '').length} characters
                  </div>
                </motion.div>
              )}

              {/* Fallback for questions without proper type */}
              {(!currentQ?.type || (currentQ?.type !== 'single' && currentQ?.type !== 'text')) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="relative"
                >
                  <textarea
                    value={currentAnswer || ''}
                    onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                    placeholder="Please type your answer here..."
                    className="w-full p-6 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:outline-none resize-none bg-white/80 backdrop-blur-sm text-lg leading-relaxed transition-all duration-300 focus:shadow-lg"
                    rows={4}
                  />
                  <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                    {(currentAnswer || '').length} characters
                  </div>
                </motion.div>
              )}

              {/* Custom text input for thumbnail text question */}
              {currentQ?.id === 'thumbnailText' && currentAnswer === 'Custom text (I\'ll specify)' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="relative mt-4"
                >
                  <textarea
                    value={answers.customText || ''}
                    onChange={(e) => onAnswersChange({ ...answers, customText: e.target.value })}
                    placeholder="Type your custom text here (e.g., 'HOW TO MASTER REACT', 'BEST WORKOUT EVER')"
                    className="w-full p-6 border-2 border-orange-200/50 rounded-2xl focus:border-orange-500 focus:outline-none resize-none bg-orange-50/80 backdrop-blur-sm text-lg leading-relaxed transition-all duration-300 focus:shadow-lg text-black"
                    rows={3}
                  />
                  <div className="absolute bottom-4 right-4 text-sm text-orange-400">
                    {(answers.customText || '').length} characters
                  </div>
                </motion.div>
              )}
            </div>

            {/* Navigation buttons */}
            <motion.div 
              className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <motion.button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center px-6 py-3 text-gray-600 bg-white/80 rounded-2xl hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </motion.button>

              <motion.button
                onClick={handleNext}
                disabled={!canProceed}
                className={`flex items-center px-8 py-3 text-white rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl ${
                  currentQuestion === questions.length - 1
                    ? 'btn-secondary'
                    : 'btn-gradient'
                }`}
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentQuestion === questions.length - 1 ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 bounce-gentle" />
                    <span className="font-semibold">Generate Thumbnail</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">Next Question</span>
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
