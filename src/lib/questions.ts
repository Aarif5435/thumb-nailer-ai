import { Question, UserAnswers } from './types';
import OpenAI from 'openai';
import { config } from './config';

// Base questions that are always asked
const baseQuestions: Question[] = [
  {
    id: 'targetAudience',
    question: 'Who is your target audience?',
    type: 'single',
    options: ['Kids (5-12)', 'Teens (13-18)', 'Young Adults (19-30)', 'Adults (31-50)', 'Professionals (25+)'],
    required: true,
  },
  {
    id: 'contentType',
    question: 'What type of content is this?',
    type: 'single',
    options: ['Tutorial/How-to', 'Review', 'Entertainment', 'News/Update', 'Vlog', 'Gaming', 'Educational'],
    required: true,
  },
  {
    id: 'emotion',
    question: 'What emotion should the thumbnail convey?',
    type: 'single',
    options: ['Excitement', 'Curiosity', 'Urgency', 'Trust', 'Fun', 'Professional', 'Mysterious'],
    required: true,
  },
  {
    id: 'keyElements',
    question: 'What should be the main focus?',
    type: 'single',
    options: ['Person\'s face', 'Product/Object', 'Text overlay', 'Action/Movement', 'Before/After', 'Multiple elements'],
    required: true,
  },
  {
    id: 'stylePreference',
    question: 'What style do you prefer?',
    type: 'single',
    options: ['Bold/Dramatic', 'Minimalist/Clean', 'Colorful/Vibrant', 'Professional/Corporate', 'Dark/Moody', 'Bright/Cheerful'],
    required: true,
  },
];

// Category-specific additional questions
const categoryQuestions: Record<string, Question[]> = {
  technical: [
    {
      id: 'techLevel',
      question: 'What\'s the difficulty level?',
      type: 'single',
      options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: false,
    },
    {
      id: 'technology',
      question: 'Which technology/language? (optional)',
      type: 'text',
      required: false,
    },
  ],
  entertainment: [
    {
      id: 'entertainmentType',
      question: 'What type of entertainment?',
      type: 'single',
      options: ['Comedy', 'Drama', 'Action', 'Mystery', 'Horror', 'Romance'],
      required: false,
    },
    {
      id: 'mood',
      question: 'What\'s the overall mood?',
      type: 'single',
      options: ['Funny/Lighthearted', 'Serious/Dramatic', 'Suspenseful', 'Inspiring', 'Shocking'],
      required: false,
    },
  ],
  gaming: [
    {
      id: 'gameGenre',
      question: 'What game genre?',
      type: 'single',
      options: ['Action', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Horror', 'Indie'],
      required: false,
    },
    {
      id: 'gamingContent',
      question: 'What type of gaming content?',
      type: 'single',
      options: ['Gameplay', 'Review', 'Tips/Guide', 'News', 'Reaction', 'Stream Highlights'],
      required: false,
    },
  ],
  lifestyle: [
    {
      id: 'lifestyleCategory',
      question: 'What lifestyle category?',
      type: 'single',
      options: ['Health/Fitness', 'Food/Cooking', 'Travel', 'Fashion', 'Home/DIY', 'Relationships'],
      required: false,
    },
    {
      id: 'lifestyleGoal',
      question: 'What\'s the main goal?',
      type: 'single',
      options: ['Inspire', 'Educate', 'Entertain', 'Motivate', 'Share Experience'],
      required: false,
    },
  ],
  education: [
    {
      id: 'subject',
      question: 'What subject area?',
      type: 'single',
      options: ['Science', 'Math', 'History', 'Language', 'Business', 'Art', 'Other'],
      required: false,
    },
    {
      id: 'educationLevel',
      question: 'What education level?',
      type: 'single',
      options: ['Elementary', 'High School', 'College', 'Professional', 'General Public'],
      required: false,
    },
  ],
  music: [
    {
      id: 'musicGenre',
      question: 'What music genre?',
      type: 'single',
      options: ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Classical', 'Country', 'Jazz', 'Other'],
      required: false,
    },
    {
      id: 'musicContent',
      question: 'What type of music content?',
      type: 'single',
      options: ['Original Song', 'Cover', 'Music Video', 'Behind the Scenes', 'Tutorial', 'Review'],
      required: false,
    },
  ],
};

export class QuestionSystem {
  detectCategory(topic: string): string {
    const topicLower = topic.toLowerCase();
    
    // Technical keywords
    if (this.containsAny(topicLower, ['code', 'programming', 'developer', 'tech', 'software', 'web', 'app', 'api', 'database', 'javascript', 'python', 'react', 'node', 'css', 'html', 'tutorial', 'coding'])) {
      return 'technical';
    }
    
    // Gaming keywords
    if (this.containsAny(topicLower, ['game', 'gaming', 'gameplay', 'stream', 'twitch', 'xbox', 'playstation', 'nintendo', 'pc gaming', 'mobile game'])) {
      return 'gaming';
    }
    
    // Education keywords
    if (this.containsAny(topicLower, ['learn', 'education', 'study', 'school', 'university', 'course', 'lesson', 'teach', 'explain', 'how to'])) {
      return 'education';
    }
    
    // Music keywords
    if (this.containsAny(topicLower, ['music', 'song', 'album', 'artist', 'band', 'concert', 'cover', 'instrumental', 'lyrics'])) {
      return 'music';
    }
    
    // Lifestyle keywords
    if (this.containsAny(topicLower, ['lifestyle', 'health', 'fitness', 'food', 'cooking', 'travel', 'fashion', 'beauty', 'home', 'diy', 'vlog'])) {
      return 'lifestyle';
    }
    
    // Default to entertainment
    return 'entertainment';
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  createDynamicQuestions(topic: string, category: string): Question[] {
    const topicLower = topic.toLowerCase();
    const questions: Question[] = [];

    // Question 1: Always ask about target audience, but customize options
    const audienceOptions = this.getAudienceOptions(category, topicLower);
    questions.push({
      id: 'targetAudience',
      question: `Who is your target audience for "${topic}"?`,
      type: 'single',
      options: audienceOptions,
      required: true,
    });

    // Question 2: Content-specific emotion/tone
    const emotionOptions = this.getEmotionOptions(category, topicLower);
    questions.push({
      id: 'emotion',
      question: this.getEmotionQuestion(category, topicLower),
      type: 'single',
      options: emotionOptions,
      required: true,
    });

    // Question 3: Visual style based on topic
    const styleOptions = this.getStyleOptions(category, topicLower);
    questions.push({
      id: 'stylePreference',
      question: `What visual style fits best for "${topic}"?`,
      type: 'single',
      options: styleOptions,
      required: true,
    });

    return questions;
  }

  private getAudienceOptions(category: string, topic: string): string[] {
    if (category === 'technical') {
      return ['Beginner Developers', 'Intermediate Programmers', 'Senior Engineers', 'Tech Enthusiasts', 'Students'];
    }
    if (category === 'gaming') {
      return ['Casual Gamers', 'Hardcore Gamers', 'Esports Fans', 'Game Developers', 'Streaming Audience'];
    }
    if (category === 'lifestyle') {
      return ['Young Adults (18-25)', 'Millennials (26-35)', 'Parents', 'Health Enthusiasts', 'General Lifestyle'];
    }
    if (category === 'education') {
      return ['Students', 'Teachers', 'Professionals', 'Lifelong Learners', 'Parents'];
    }
    // Default options
    return ['Kids (5-12)', 'Teens (13-18)', 'Young Adults (19-30)', 'Adults (31-50)', 'All Ages'];
  }

  private getEmotionOptions(category: string, topic: string): string[] {
    if (topic.includes('tutorial') || topic.includes('how to')) {
      return ['Helpful & Trustworthy', 'Encouraging', 'Professional', 'Friendly', 'Confident'];
    }
    if (topic.includes('review') || topic.includes('vs')) {
      return ['Honest & Analytical', 'Excited', 'Critical', 'Informative', 'Comparative'];
    }
    if (category === 'entertainment') {
      return ['Fun & Energetic', 'Hilarious', 'Dramatic', 'Mysterious', 'Shocking'];
    }
    if (category === 'gaming') {
      return ['Epic & Intense', 'Competitive', 'Fun & Casual', 'Mysterious', 'Hype & Excitement'];
    }
    // Default emotions
    return ['Excitement', 'Curiosity', 'Trust', 'Fun', 'Professional', 'Urgency'];
  }

  private getEmotionQuestion(category: string, topic: string): string {
    if (topic.includes('tutorial')) {
      return 'What feeling should your tutorial thumbnail convey?';
    }
    if (topic.includes('review')) {
      return 'What tone should your review thumbnail have?';
    }
    if (category === 'gaming') {
      return 'What gaming vibe should your thumbnail capture?';
    }
    return 'What emotion should your thumbnail convey?';
  }

  private getStyleOptions(category: string, topic: string): string[] {
    if (category === 'technical') {
      return ['Clean & Professional', 'Modern Tech', 'Coding Theme', 'Minimalist', 'Dark Mode Style'];
    }
    if (category === 'gaming') {
      return ['Epic Gaming Style', 'Neon/Cyberpunk', 'Retro Gaming', 'Esports Style', 'Fantasy Theme'];
    }
    if (category === 'lifestyle') {
      return ['Bright & Colorful', 'Instagram Style', 'Minimalist Aesthetic', 'Warm & Cozy', 'Modern Lifestyle'];
    }
    if (topic.includes('food') || topic.includes('cooking')) {
      return ['Food Photography Style', 'Warm & Appetizing', 'Restaurant Quality', 'Home Cooking', 'Colorful & Fresh'];
    }
    // Default styles
    return ['Bold/Dramatic', 'Minimalist/Clean', 'Colorful/Vibrant', 'Professional/Corporate', 'Creative/Artistic'];
  }

  private getLogoOptions(category: string, topic: string): string[] {
    if (category === 'technical') {
      return ['Tech company logo', 'Programming language logo', 'Generic tech icon', 'Personal brand logo', 'No logo'];
    }
    if (category === 'gaming') {
      return ['Gaming brand logo', 'Game-specific logo', 'Gaming controller icon', 'Personal gaming brand', 'No logo'];
    }
    if (category === 'lifestyle') {
      return ['Personal brand logo', 'Lifestyle brand icon', 'Social media handle', 'Minimalist logo', 'No logo'];
    }
    if (topic.includes('food') || topic.includes('cooking')) {
      return ['Restaurant/Chef logo', 'Food brand logo', 'Cooking utensil icon', 'Personal chef brand', 'No logo'];
    }
    if (topic.includes('business') || topic.includes('entrepreneur')) {
      return ['Company logo', 'Professional brand', 'Business icon', 'Personal brand', 'No logo'];
    }
    // Default logo options
    return ['Personal brand logo', 'Channel logo', 'Topic-related icon', 'Minimalist brand mark', 'No logo'];
  }

  async getQuestionsForTopic(topic: string): Promise<Question[]> {
    try {
      // Use GPT-4o-mini for topic-specific questions
      const openai = new OpenAI({
        apiKey: config.openai.apiKey,
      });

      const prompt = `Generate exactly 5 engaging questions to help create a YouTube thumbnail for the topic: "${topic}".

The questions should be:
1. Relevant to the specific topic and content type
2. Help understand the target audience and their interests
3. Determine the visual style, mood, and emotional appeal
4. Identify key visual elements and symbols to include
5. Understand text and branding preferences

IMPORTANT: Make the questions highly specific to "${topic}". For example:
- If it's a cooking video, ask about food styling, kitchen aesthetics, etc.
- If it's a tech tutorial, ask about software, devices, coding themes, etc.
- If it's a fitness video, ask about workout style, equipment, motivation, etc.
- If it's a gaming video, ask about game genre, visual effects, gaming culture, etc.

CRITICAL: Each question must have the correct "type" field:
- Use "single" for multiple choice questions with options
- Use "text" for open-ended questions that need text input

MANDATORY: Include this question about text:
{
  "id": "thumbnailText",
  "question": "What text should appear on your thumbnail?",
  "type": "single",
  "options": ["Auto-generate from topic", "Custom text (I'll specify)", "No text needed"],
  "required": true
}

Generate exactly 5 questions total in this format:
{
  "questions": [
    {
      "id": "targetAudience",
      "question": "Who is your target audience for this ${topic} video?",
      "type": "single",
      "options": ["Beginners", "Intermediate", "Advanced", "General audience"],
      "required": true
    },
    {
      "id": "contentType",
      "question": "What type of content is this ${topic} video?",
      "type": "single",
      "options": ["Tutorial/How-to", "Review/Analysis", "Entertainment", "Educational", "Product Showcase"],
      "required": true
    },
    {
      "id": "emotion",
      "question": "What emotion should your thumbnail convey?",
      "type": "single",
      "options": ["Excitement", "Curiosity", "Trust", "Fun", "Professional"],
      "required": true
    },
    {
      "id": "keyElements",
      "question": "What specific elements from ${topic} should be featured in the thumbnail?",
      "type": "text",
      "required": true
    },
    {
      "id": "thumbnailText",
      "question": "What text should appear on your thumbnail?",
      "type": "single",
      "options": ["Auto-generate from topic", "Custom text (I'll specify)", "No text needed"],
      "required": true
    }
  ]
}

Make each question contextual to "${topic}" and relevant to YouTube thumbnail creation.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert YouTube thumbnail designer. Generate contextual questions based on the topic.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return this.getFallbackQuestions(topic);
      }

      try {
        const parsed = JSON.parse(content);
        
        // Validate the questions structure
        if (parsed.questions && Array.isArray(parsed.questions)) {
          const validatedQuestions = parsed.questions.map((q: any) => ({
            id: q.id || `question_${Math.random()}`,
            question: q.question || 'Please answer this question',
            type: q.type === 'text' ? 'text' : 'single',
            options: q.options || ['Option 1', 'Option 2', 'Option 3'],
            required: q.required !== false
          }));
          
          return validatedQuestions;
        }
        
        return this.getFallbackQuestions(topic);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return this.getFallbackQuestions(topic);
      }
    } catch (error) {
      console.error('Error getting AI questions:', error);
      return this.getFallbackQuestions(topic);
    }
  }

  private getFallbackQuestions(topic: string): Question[] {
    const category = this.detectCategory(topic);
    
    // Create exactly 5 questions
    const questions: Question[] = [];
    
    // Question 1: Target Audience (always required)
    const audienceOptions = this.getAudienceOptions(category, topic.toLowerCase());
    questions.push({
      id: 'targetAudience',
      question: `Who is your target audience for "${topic}"?`,
      type: 'single',
      options: audienceOptions,
      required: true,
    });
    
    // Question 2: Emotion/Tone (always required)
    const emotionOptions = this.getEmotionOptions(category, topic.toLowerCase());
    questions.push({
      id: 'emotion',
      question: this.getEmotionQuestion(category, topic.toLowerCase()),
      type: 'single',
      options: emotionOptions,
      required: true,
    });
    
    // Question 3: Visual Style (always required)
    const styleOptions = this.getStyleOptions(category, topic.toLowerCase());
    questions.push({
      id: 'stylePreference',
      question: `What visual style fits best for "${topic}"?`,
      type: 'single',
      options: styleOptions,
      required: true,
    });
    
    // Question 4: Text Overlay (required)
    questions.push({
      id: 'textOverlay',
      question: 'What text should appear on your thumbnail?',
      type: 'single',
      options: ['Custom text (I\'ll specify)', 'Auto-generate from topic', 'No text needed'],
      required: true,
    });
    
    // Question 5: Logo/Branding (required)
    questions.push({
      id: 'logoPreference',
      question: 'Do you want a logo or branding element?',
      type: 'single',
      options: this.getLogoOptions(category, topic.toLowerCase()),
      required: true,
    });
    
    return questions;
  }

  validateAnswers(answers: UserAnswers, questions: Question[]): boolean {
    for (const question of questions) {
      if (question.required) {
        const answer = answers[question.id as keyof UserAnswers] || answers.additionalAnswers?.[question.id];
        if (!answer || answer?.toString().trim() === '') {
          return false;
        }
      }
    }
    return true;
  }

  formatAnswersForSearch(answers: UserAnswers): string {
    const searchTerms: string[] = [
      answers.topic,
      answers.targetAudience,
      answers.contentType,
      answers.emotion,
      answers.keyElements,
      answers.stylePreference,
    ];

    // Add additional answers
    if (answers.additionalAnswers) {
      searchTerms.push(...Object.values(answers.additionalAnswers));
    }

    return searchTerms.filter(Boolean).join(' ');
  }
}

export const questionSystem = new QuestionSystem();
