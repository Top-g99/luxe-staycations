import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/lib/userManager';

export async function GET(request: NextRequest) {
  try {
    // Initialize UserManager if not already done
    if (typeof window === 'undefined') {
      userManager.initialize();
    }
    
    // Get all users
    const users = userManager.getAllUsers();
    
    return NextResponse.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password || !body.firstName || !body.lastName || !body.phone) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: email, password, firstName, lastName, phone' 
        },
        { status: 400 }
      );
    }
    
    // Create new user
    const newUser = userManager.registerUser({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      role: body.role || 'guest'
    });
    
    if (!newUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User with this email already exists' 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create user' 
      },
      { status: 500 }
    );
  }
}

