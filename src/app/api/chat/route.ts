import { NextRequest, NextResponse } from 'next/server';

import Groq from 'groq-sdk';

let groq: Groq | null = null;

const initializeGroq = () => {
  if (!groq && process.env.GROQ_API_KEY) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
};

export async function POST(request: NextRequest) {
  try {
    // Initialize Groq client
    const groqClient = initializeGroq();

    if (!groqClient) {
      return NextResponse.json(
        {
          error:
            'Chat service is not configured. Please contact administrator.',
        },
        { status: 503 },
      );
    }
    const { message, contextData, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 },
      );
    }

    // Build the system prompt with context
    let systemPrompt = `You are a helpful AI assistant for an educational platform. You help students with their queries and provide accurate, educational support.

Your role is to:
1. Answer student questions about academics, assignments, and learning
2. Provide educational guidance and study tips
3. Help with general questions about the platform
4. Be encouraging and supportive in your responses
5. Use any relevant context provided to give personalized responses

Guidelines:
- Keep responses concise and helpful (3-4 sentences maximum)
- If you don't know something specific, say so honestly but offer general guidance
- Always maintain a friendly and educational tone
- Focus on helping students learn and grow
- Use the context data when it's relevant to the question
- If context data doesn't apply to the question, rely on general knowledge`;

    // Add context data if provided
    if (contextData && Object.keys(contextData).length > 0) {
      systemPrompt += `\n\nRelevant context for this conversation:`;

      if (contextData.platform) {
        systemPrompt += `\nPlatform: ${contextData.platform}`;
      }

      if (contextData.organization) {
        systemPrompt += `\nOrganization: ${contextData.organization}`;
      }

      if (contextData.supportType) {
        systemPrompt += `\nYour role: ${contextData.supportType}`;
      }

      if (contextData.userData) {
        systemPrompt += `\nStudent info: ${JSON.stringify(contextData.userData)}`;
      }

      if (contextData.academicData) {
        systemPrompt += `\nAcademic context: ${JSON.stringify(contextData.academicData)}`;
      }

      if (contextData.currentSubjects) {
        systemPrompt += `\nCurrent subjects: ${contextData.currentSubjects.join(', ')}`;
      }

      if (contextData.upcomingExams) {
        systemPrompt += `\nUpcoming exams: ${contextData.upcomingExams.join(', ')}`;
      }

      if (contextData.assignments) {
        systemPrompt += `\nPending assignments: ${contextData.assignments.join(', ')}`;
      }
    }

    // Build messages array for the conversation
    const messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }> = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
    ];

    // Add conversation history if available
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      });
    }

    // Add the current user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call Groq API
    const chatCompletion = await groqClient.chat.completions.create({
      messages: messages,
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct', // You can also use 'llama2-70b-4096' or other available models
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      stream: false,
    });

    const assistantMessage =
      chatCompletion.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'API configuration error. Please check your Groq API key.' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to process your request. Please try again later.' },
      { status: 500 },
    );
  }
}
