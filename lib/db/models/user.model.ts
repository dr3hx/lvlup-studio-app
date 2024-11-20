import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: String,
  // OAuth related fields
  providers: [{
    type: String,
    enum: ['google', 'facebook', 'linkedin', 'github', 'credentials'],
  }],
  // For credentials auth
  password: String,
  // Marketing platform connections
  connections: {
    google: {
      accessToken: String,
      refreshToken: String,
      analytics: Boolean,
      ads: Boolean,
    },
    facebook: {
      accessToken: String,
      refreshToken: String,
      pages: [String],
      ads: Boolean,
    },
    linkedin: {
      accessToken: String,
      refreshToken: String,
      pages: [String],
    },
    twitter: {
      accessToken: String,
      refreshToken: String,
    },
  },
  // Dashboard preferences
  dashboardPreferences: {
    layout: {
      type: String,
      default: 'default',
    },
    widgets: [{
      type: {
        type: String,
        enum: ['analytics', 'social', 'ads', 'content'],
      },
      position: Number,
      visible: Boolean,
    }],
  },
}, {
  timestamps: true,
});

// Only hash password if it's modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    if (this.password) {
      const bcrypt = await import('bcryptjs');
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
