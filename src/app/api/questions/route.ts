import { NextResponse } from "next/server";
import { questionSystem } from "@/lib/questions";
import { z } from "zod";

const QuestionRequestSchema = z.object({
  topic: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic } = QuestionRequestSchema.parse(body);

    const questions = await questionSystem.getQuestionsForTopic(topic);
    const category = questionSystem.detectCategory(topic);

    return NextResponse.json({
      questions,
      category,
      topic,
    });
  } catch (error) {
    console.error("Error getting questions:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return sample questions for testing
  const sampleQuestions = await questionSystem.getQuestionsForTopic("React tutorial for beginners");
  
  return NextResponse.json({
    questions: sampleQuestions,
    category: "technical",
    topic: "React tutorial for beginners",
  });
}
