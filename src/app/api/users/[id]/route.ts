import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/lib/userManager';
import { SecureAPIRoute, API_SECURITY_PRESETS, APIValidation, APIResponse } from '@/lib/security/secureApiWrapper';

// Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return SecureAPIRoute(async (req: NextRequest) => {
    try {
      const { id } = await params;
      // Validate user ID
      if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }

      // Initialize UserManager if not already done
      if (typeof window === 'undefined') {
        userManager.initialize();
      }
      
      const user = userManager.getUserById(id);
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({ data: user });
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
  });
}

// Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return SecureAPIRoute(async (req: NextRequest) => {
    try {
      const { id } = await params;
      // Validate user ID
      if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }

      const body = await request.json();
      
      // Validate required fields
      const validation = APIValidation.validate(body);
      if (!validation) {
        return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
      }

      // Initialize UserManager if not already done
      if (typeof window === 'undefined') {
        userManager.initialize();
      }
      
      const updatedUser = userManager.updateUser(id, body);
      
      if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({ data: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
  });
}

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return SecureAPIRoute(async (req: NextRequest) => {
    try {
      const { id } = await params;
      // Validate user ID
      if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }

      // Initialize UserManager if not already done
      if (typeof window === 'undefined') {
        userManager.initialize();
      }
      
      const success = userManager.deleteUser(id);
      
      if (!success) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
  });
}