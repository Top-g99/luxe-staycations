import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/lib/userManager';
import { SecureAPIRoute, API_SECURITY_PRESETS, APIValidation, APIResponse } from '@/lib/security/secureApiWrapper';

export async function GET(request: NextRequest) {
  return SecureAPIRoute(async (req: NextRequest) => {
    try {
      // Initialize UserManager if not already done
      if (typeof window === 'undefined') {
        userManager.initialize();
      }
      
      // Get all users
      const users = await userManager.getAllUsers();
      
      return NextResponse.json({
        data: {
          users,
          count: users.length
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return SecureAPIRoute(async (req: NextRequest) => {
    try {
      const body = await req.json();
      
      // Validate request body
      const validation = APIValidation.validate(body);
      
      if (!validation) {
        return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
      }
      
      const { email, password, firstName, lastName, phone, role } = body;
      
      // Create new user
      const newUser = await userManager.registerUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: role || 'guest'
      });
      
      if (!newUser) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
      
      return NextResponse.json({ data: newUser, message: 'User created successfully' }, { status: 201 });
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
  });
}

