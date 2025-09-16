import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/lib/userManager';

// Update user status (activate/deactivate)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Initialize UserManager if not already done
    if (typeof window === 'undefined') {
      userManager.initialize();
    }
    
    // Check if user exists
    const existingUser = userManager.getUserById(id);
    if (!existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }
    
    const { isActive } = body;
    
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'isActive must be a boolean value' 
        },
        { status: 400 }
      );
    }
    
    let success: boolean;
    
    if (isActive) {
      // Reactivate user
      success = await userManager.reactivateUser(id);
    } else {
      // Deactivate user
      success = await userManager.deactivateUser(id);
    }
    
    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to ${isActive ? 'activate' : 'deactivate'} user` 
        },
        { status: 500 }
      );
    }
    
    // Get updated user
    const updatedUser = userManager.getUserById(id);
    
    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user status' 
      },
      { status: 500 }
    );
  }
}
