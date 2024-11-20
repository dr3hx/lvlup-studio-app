import mongoose from 'mongoose';

const aiContentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    enum: ['facebook', 'linkedin', 'twitter', 'instagram'],
    required: true,
  },
  contentType: {
    type: String,
    enum: ['post', 'article', 'caption', 'thread'],
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  metadata: {
    targetAudience: String,
    tone: String,
    keywords: [String],
    length: Number,
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'published', 'archived'],
    default: 'draft',
  },
  publishSchedule: {
    isScheduled: {
      type: Boolean,
      default: false,
    },
    scheduledDate: Date,
  },
  performance: {
    impressions: Number,
    engagement: Number,
    clicks: Number,
    shares: Number,
  },
  version: {
    type: Number,
    default: 1,
  },
  // Store previous versions
  history: [{
    content: String,
    prompt: String,
    metadata: {
      targetAudience: String,
      tone: String,
      keywords: [String],
      length: Number,
    },
    createdAt: Date,
  }],
}, {
  timestamps: true,
});

// Create indexes for efficient querying
aiContentSchema.index({ userId: 1, status: 1 });
aiContentSchema.index({ userId: 1, platform: 1 });
aiContentSchema.index({ 'publishSchedule.scheduledDate': 1 }, { sparse: true });

export const AIContent = mongoose.models.AIContent || 
  mongoose.model('AIContent', aiContentSchema);
