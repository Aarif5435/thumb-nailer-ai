'use client';

import { useState, useEffect, useRef } from 'react';
import { Question } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, ArrowUp } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ChatQuestionFormProps {
  questions: Question[];
  answers: { [key: string]: string };
  onAnswersChange: (answers: { [key: string]: string }) => void;
  onComplete: () => void;
  topic: string;
}

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  options?: string[];
  questionId?: string;
  isComplete?: boolean;
}

export function ChatQuestionForm({ questions, answers, onAnswersChange, onComplete, topic }: ChatQuestionFormProps) {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current questions including conditional ones
  const getCurrentQuestions = () => {
    const baseQuestions = [...questions];
    
    if (answers.textOverlay === "Custom text (I'll specify)") {
      const customTextQuestion: Question = {
        id: 'customText',
        question: 'What text should appear on your thumbnail?',
        type: 'text',
        required: true,
      };
      
      const textOverlayIndex = baseQuestions.findIndex(q => q.id === 'textOverlay');
      if (textOverlayIndex !== -1) {
        baseQuestions.splice(textOverlayIndex + 1, 0, customTextQuestion);
      }
    }
    
    if (answers.logoPreference && !answers.logoPreference.includes('No logo') && !answers.logoPreference.includes('Generic') && !answers.logoPreference.includes('icon')) {
      const logoTextQuestion: Question = {
        id: 'logoText',
        question: 'What should your logo/brand text say?',
        type: 'text',
        required: true,
      };
      
      baseQuestions.push(logoTextQuestion);
    }
    
    return baseQuestions;
  };

  const currentQuestions = getCurrentQuestions();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([{
          id: '1',
          type: 'bot',
          content: `Great! I'm going to help you create an amazing thumbnail for "${topic}". Let me ask you a few quick questions to make it perfect! 🎯`,
        }]);
        setIsTyping(false);
        
        // Ask first question after a delay
        setTimeout(() => {
          askNextQuestion();
        }, 1000);
      }, 1000);
    }
  }, []);

  const askNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length) {
      const question = currentQuestions[currentQuestionIndex];
      setIsTyping(true);
      
      setTimeout(() => {
        const newMessage: Message = {
          id: `q-${currentQuestionIndex}`,
          type: 'bot',
          content: question.question,
          options: question.type === 'single' ? question.options : undefined,
          questionId: question.id,
        };
        
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(false);
      }, 800);
    } else {
      // All questions answered
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 'complete',
          type: 'bot',
          content: '🎨 Perfect! I have everything I need. Let me create your viral thumbnail now!',
          isComplete: true,
        }]);
        setIsTyping(false);
        
        setTimeout(() => {
          onComplete();
        }, 2000);
      }, 800);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    // Add user message
    const userMessage: Message = {
      id: `a-${Date.now()}`,
      type: 'user',
      content: answer,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Update answers
    const newAnswers = { ...answers, [questionId]: answer };
    onAnswersChange(newAnswers);
    
    // Move to next question
    setCurrentQuestionIndex(prev => prev + 1);
    
    // Ask next question after delay
    setTimeout(() => {
      askNextQuestion();
    }, 1000);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (currentQuestion?.type === 'text') {
      handleAnswer(currentQuestion.id, textInput.trim());
      setTextInput('');
    }
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];
  const showTextInput = currentQuestion?.type === 'text';
  const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;

  return (
    <div className={`max-w-4xl mx-auto h-[80vh] flex flex-col ${
      isDark ? 'bg-gray-900' : 'bg-white'
    } rounded-3xl shadow-2xl overflow-hidden`}>
      
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Thumb-nailer AI
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Creating your perfect thumbnail
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {Math.round(progress)}% Complete
            </div>
            <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
              <motion.div
                className="h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-3xl ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500' 
                    : 'bg-gradient-to-r from-red-500 to-orange-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                
                {/* Message Content */}
                <div className={`flex flex-col space-y-2 ${
                  message.type === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`px-4 py-3 rounded-2xl max-w-md ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : isDark 
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                  
                  {/* Options */}
                  {message.options && message.type === 'bot' && (
                    <div className="grid gap-2 w-full max-w-md">
                      {message.options.map((option, index) => (
                        <motion.button
                          key={option}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          onClick={() => message.questionId && handleAnswer(message.questionId, option)}
                          className={`text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                            isDark
                              ? 'bg-gray-800 border-gray-700 text-white hover:border-red-500 hover:bg-gray-700'
                              : 'bg-white border-gray-200 text-gray-900 hover:border-red-500 hover:bg-red-50'
                          } hover:shadow-md transform hover:scale-[1.02]`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="font-medium">{option}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                  
                  {/* Complete Button */}
                  {message.isComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center space-x-2 text-green-500"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">Generating thumbnail...</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className={`px-4 py-3 rounded-2xl ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        isDark ? 'bg-gray-600' : 'bg-gray-400'
                      }`}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {showTextInput && (
        <div className={`p-4 border-t ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <form onSubmit={handleTextSubmit} className="flex space-x-3">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your answer..."
              className={`flex-1 px-4 py-3 rounded-2xl border-2 transition-all duration-200 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500'
                  : 'bg-black border-gray-300 text-black placeholder-gray-500 focus:border-red-500'
              } focus:outline-none`}
              autoFocus
            />
            <motion.button
              type="submit"
              disabled={!textInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={{ scale: textInput.trim() ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          </form>
        </div>
      )}
    </div>
  );
}
