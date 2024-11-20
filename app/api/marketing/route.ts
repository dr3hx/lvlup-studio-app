import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db/connect';
import { MarketingData, User } from '@/lib/db/models';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const platform = searchParams.get('platform');
    const dataType = searchParams.get('dataType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = {
      userId: session.user.id,
    };

    if (platform) query.platform = platform;
    if (dataType) query.dataType = dataType;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Fetch marketing data
    const data = await MarketingData.find(query)
      .sort({ date: -1 })
      .limit(100);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Marketing data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketing data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { platform, dataType, data } = body;

    if (!platform || !dataType || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new marketing data entry
    const marketingData = await MarketingData.create({
      userId: session.user.id,
      platform,
      dataType,
      date: new Date(),
      ...(dataType === 'analytics' && { analytics: data }),
      ...(dataType === 'social' && { socialMetrics: data }),
      ...(dataType === 'ads' && { adsMetrics: data }),
    });

    return NextResponse.json(marketingData);
  } catch (error) {
    console.error('Marketing data creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create marketing data' },
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
    const { id, data } = body;

    if (!id || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update marketing data
    const marketingData = await MarketingData.findOneAndUpdate(
      {
        _id: id,
        userId: session.user.id,
      },
      { $set: data },
      { new: true }
    );

    if (!marketingData) {
      return NextResponse.json(
        { error: 'Marketing data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(marketingData);
  } catch (error) {
    console.error('Marketing data update error:', error);
    return NextResponse.json(
      { error: 'Failed to update marketing data' },
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
        { error: 'Missing marketing data ID' },
        { status: 400 }
      );
    }

    // Delete marketing data
    const result = await MarketingData.deleteOne({
      _id: id,
      userId: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Marketing data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Marketing data deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete marketing data' },
      { status: 500 }
    );
  }
}
