import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/connect';
import { AIContent } from '@/lib/db/models';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { 
      platform,
      contentType,
      prompt,
      metadata
    } = body;

    if (!platform || !contentType || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate content using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional social media content creator. Create ${contentType} content for ${platform} that is engaging and optimized for the platform. Consider the following details:
          - Target Audience: ${metadata?.targetAudience || 'General'}
          - Tone: ${metadata?.tone || 'Professional'}
          - Keywords: ${metadata?.keywords?.join(', ') || 'None specified'}
          - Maximum Length: ${metadata?.length || 'Platform default'}`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: metadata?.length || 500,
    });

    const generatedContent = completion.choices[0].message.content;

    if (!generatedContent) {
      throw new Error('Failed to generate content');
    }

    // Save the generated content
    const aiContent = await AIContent.create({
      userId: session.user.id,
      title: prompt.slice(0, 100), // Use first 100 chars of prompt as title
      content: generatedContent,
      platform,
      contentType,
      prompt,
      metadata,
      status: 'draft',
    });

    return NextResponse.json(aiContent);
  } catch (error) {
    console.error('AI content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build query
    const query: any = {
      userId: session.user.id,
    };

    if (platform) query.platform = platform;
    if (status) query.status = status;

    // Fetch AI content with pagination
    const [content, total] = await Promise.all([
      AIContent.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AIContent.countDocuments(query),
    ]);

    return NextResponse.json({
      content,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('AI content fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI content' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { id, content, status, metadata } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing content ID' },
        { status: 400 }
      );
    }

    // Get existing content
    const existingContent = await AIContent.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // If content is being modified, store current version in history
    if (content && content !== existingContent.content) {
      existingContent.history.push({
        content: existingContent.content,
        prompt: existingContent.prompt,
        metadata: existingContent.metadata,
        createdAt: new Date(),
      });
      existingContent.version += 1;
    }

    // Update content
    Object.assign(existingContent, {
      ...(content && { content }),
      ...(status && { status }),
      ...(metadata && { metadata }),
    });

    await existingContent.save();

    return NextResponse.json(existingContent);
  } catch (error) {
    console.error('AI content update error:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing content ID' },
        { status: 400 }
      );
    }

    // Delete content
    const result = await AIContent.deleteOne({
      _id: id,
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('AI content deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
