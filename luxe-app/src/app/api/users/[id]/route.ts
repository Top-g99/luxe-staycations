import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/lib/userManager';
import { SecureAPIRoute, API_SECURITY_PRESETS, APIValidation, APIResponse } from '@/lib/security/secureApiWrapper';

// Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return SecureAPIRoute.GET(request, async (req: NextRequest) => {
    try {
      const { id } = await params;
      // Validate user ID
      if (!id || typeof id !== 'string') {
        return APIResponse.error('Invalid user ID', 400);
      }

      // Initialize UserManager if not already done
      if (typeof window === 'undefined') {
        userManager.initialize();
      }
      
      const user = userManager.getUserById(id);
      
      if (!user) {
        return APIResponse.notFound('User not found');
      }
      
      return APIResponse.success(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return APIResponse.serverError('Failed to fetch user');
    }
  }, API_SECURITY_PRESETS.ADMIN);
}

// Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return SecureAPIRoute.PUT(request, async (req: NextRequest) => {
    try {
      const { id } = await params;
      // Validate user ID
      if (!id || typeof id !== 'string') {
        return APIResponse.error('Invalid user ID', 400);
      }

      const body = await req.json();
      
      // Validate request body
      const validation = APIValidation.validateRequestBody(body, {
        email: ['email'],
        phone: ['phone'],
        password: body.password ? ['password'] : undefined,
        maxLength: {
          firstName: 50,
          lastName: 50,
          email: 100,
          phone: 15
        }
      });

      if (!validation.isValid) {
        return APIResponse.validationError(validation.errors!);
      }
      
      // Initialize UserManager if not already done
      if (typeof window === 'undefined') {
        userManager.initialize();
      }
      
      // Check if user exists
      const existingUser = userManager.getUserById(id);
      if (!existingUser) {
        return APIResponse.notFound('User not found');
      }

      // Prepare update data
      const updateData: any = {
        firstName: (validation.data as any)?.firstName,
        lastName: (validation.data as any)?.lastName,
        phone: (validation.data as any)?.phone,
        role: (validation.data as any)?.role,
        preferences: (validation.data as any)?.preferences
      };

      // Only update password if provided
      if ((validation.data as any)?.password && (validation.data as any).password.trim() !== '') {
        updateData.password = (validation.data as any).password;
      }

      // Update user profile
      const success = userManager.updateUserProfile(id, updateData);

      if (!success) {
        return APIResponse.serverError('Failed to update user');
      }

      // Get updated user
      const updatedUser = userManager.getUserById(id);
      
      return APIResponse.success(updatedUser, 'User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      return APIResponse.serverError('Failed to update user');
    }
  }, API_SECURITY_PRESETS.ADMIN);
}

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return SecureAPIRoute.DELETE(request, async (req: NextRequest) => {
    try {
      const { id } = await params;
      // Validate user ID
      if (!id || typeof id !== 'string') {
        return APIResponse.error('Invalid user ID', 400);
      }

      // Initialize UserManager if not already done
      if (typeof window === 'undefined') {
        userManager.initialize();
      }
      
      // Check if user exists
      const existingUser = userManager.getUserById(id);
      if (!existingUser) {
        return APIResponse.notFound('User not found');
      }

      // Prevent deletion of the last admin user
      if (existingUser.role === 'admin') {
        const adminUsers = userManager.getUsersByRole('admin');
        if (adminUsers.length <= 1) {
          return APIResponse.error('Cannot delete the last administrator user', 400);
        }
      }

      // Deactivate user instead of deleting (safer approach)
      const success = userManager.deactivateUser(id);
      
      if (!success) {
        return APIResponse.serverError('Failed to deactivate user');
      }
      
      return APIResponse.success(null, 'User deactivated successfully');
    } catch (error) {
      console.error('Error deactivating user:', error);
      return APIResponse.serverError('Failed to deactivate user');
    }
  }, API_SECURITY_PRESETS.ADMIN);
}
