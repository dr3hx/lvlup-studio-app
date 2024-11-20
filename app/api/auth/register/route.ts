import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    // Detailed connection logging
    console.log('Attempting to connect to database...');
    await dbConnect();
    console.log('Database connection successful');

    const body = await req.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      console.error('Missing required fields', { name, email, passwordProvided: !!password });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format', { email });
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      console.error('Password too short', { passwordLength: password.length });
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error('User already exists', { email });
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    console.log('Creating new user...');
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      providers: ['credentials'],
      dashboardPreferences: {
        layout: 'default',
        widgets: [
          { type: 'analytics', position: 0, visible: true },
          { type: 'social', position: 1, visible: true },
          { type: 'ads', position: 2, visible: true },
          { type: 'content', position: 3, visible: true },
        ],
      },
    });

    console.log('User created successfully', { 
      userId: user._id, 
      email: user.email, 
      name: user.name 
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    
    // More detailed error logging
    if (error instanceof mongoose.Error.ValidationError) {
      console.error('Mongoose validation error:', error.errors);
      return NextResponse.json(
        { error: 'Validation failed. Please check your input.' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    return NextResponse.json(
      { error: 'Failed to register user. Please try again later.' },
      { status: 500 }
    );
  }
}
