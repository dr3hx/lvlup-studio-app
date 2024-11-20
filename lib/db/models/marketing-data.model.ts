import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  pageViews: Number,
  sessions: Number,
  users: Number,
  bounceRate: Number,
  avgSessionDuration: Number,
  topPages: [{
    path: String,
    views: Number,
  }],
});

const socialMetricsSchema = new mongoose.Schema({
  followers: Number,
  engagement: Number,
  impressions: Number,
  clicks: Number,
  posts: [{
    id: String,
    type: String,
    engagement: Number,
    impressions: Number,
    clicks: Number,
  }],
});

const adsMetricsSchema = new mongoose.Schema({
  spend: Number,
  impressions: Number,
  clicks: Number,
  conversions: Number,
  ctr: Number,
  cpc: Number,
  campaigns: [{
    id: String,
    name: String,
    spend: Number,
    impressions: Number,
    clicks: Number,
    conversions: Number,
    ctr: Number,
    cpc: Number,
  }],
});

const marketingDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  platform: {
    type: String,
    enum: ['google', 'facebook', 'linkedin', 'twitter'],
    required: true,
  },
  dataType: {
    type: String,
    enum: ['analytics', 'social', 'ads'],
    required: true,
  },
  analytics: analyticsSchema,
  socialMetrics: socialMetricsSchema,
  adsMetrics: adsMetricsSchema,
}, {
  timestamps: true,
});

// Create compound index for efficient querying
marketingDataSchema.index({ userId: 1, platform: 1, date: 1 });

export const MarketingData = mongoose.models.MarketingData || 
  mongoose.model('MarketingData', marketingDataSchema);
