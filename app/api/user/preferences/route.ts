import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.user.id).select('dashboardPreferences connections');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      dashboardPreferences: user.dashboardPreferences,
      connections: user.connections,
    });
  } catch (error) {
    console.error('Preferences fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
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
    const { dashboardPreferences } = body;

    if (!dashboardPreferences) {
      return NextResponse.json(
        { error: 'Missing dashboard preferences' },
        { status: 400 }
      );
    }

    // Update user preferences
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { dashboardPreferences } },
      { new: true }
    ).select('dashboardPreferences');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user.dashboardPreferences);
  } catch (error) {
    console.error('Preferences update error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

// Handle platform connections
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { platform, connectionData } = body;

    if (!platform || !connectionData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update platform connection
    const updateQuery = {
      [`connections.${platform}`]: connectionData
    };

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateQuery },
      { new: true }
    ).select('connections');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user.connections);
  } catch (error) {
    console.error('Connection update error:', error);
    return NextResponse.json(
      { error: 'Failed to update connection' },
      { status: 500 }
    );
  }
}

// Remove platform connection
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const platform = searchParams.get('platform');

    if (!platform) {
      return NextResponse.json(
        { error: 'Missing platform parameter' },
        { status: 400 }
      );
    }

    // Remove platform connection
    const updateQuery = {
      [`connections.${platform}`]: 1
    };

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $unset: updateQuery },
      { new: true }
    ).select('connections');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user.connections);
  } catch (error) {
    console.error('Connection removal error:', error);
    return NextResponse.json(
      { error: 'Failed to remove connection' },
      { status: 500 }
    );
  }
}
