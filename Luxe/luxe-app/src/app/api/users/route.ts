import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/lib/userManager';
import { SecureAPIRoute, API_SECURITY_PRESETS, APIValidation, APIResponse } from '@/lib/security/secureApiWrapper';

export async function GET(request: NextRequest) {
  return SecureAPIRoute.GET(request, async (req: NextRequest) => {
    try {
      // Initialize UserManager if not already done
      if (typeof window === 'undefined') {
        userManager.initialize();
      }
      
      // Get all users
      const users = userManager.getAllUsers();
      
      return APIResponse.success({
        users,
        count: users.length
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return APIResponse.serverError('Failed to fetch users');
    }
  }, API_SECURITY_PRESETS.ADMIN);
}

export async function POST(request: NextRequest) {
  return SecureAPIRoute.POST(request, async (req: NextRequest) => {
    try {
      const body = await req.json();
      
      // Validate request body
      const validation = APIValidation.validateRequestBody(body, {
        required: ['email', 'password', 'firstName', 'lastName', 'phone'],
        email: ['email'],
        phone: ['phone'],
        password: ['password'],
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
      
      const { email, password, firstName, lastName, phone, role } = validation.data as any;
      
      // Create new user
      const newUser = userManager.registerUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        role: role || 'guest'
      });
      
      if (!newUser) {
        return APIResponse.error('User with this email already exists', 409);
      }
      
      return APIResponse.success(newUser, 'User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
      return APIResponse.serverError('Failed to create user');
    }
  }, API_SECURITY_PRESETS.ADMIN);
}

