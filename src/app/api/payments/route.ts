import { NextRequest, NextResponse } from 'next/server';
import { paymentManager } from '@/lib/paymentManager';

export async function GET(request: NextRequest) {
  try {
    // Initialize PaymentManager if not already done
    if (typeof window === 'undefined') {
      paymentManager.initialize();
    }
    
    // Get all payment transactions
    const transactions = await paymentManager.getAllTransactions();
    
    return NextResponse.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch payment transactions' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.bookingId || !body.guestName || !body.propertyName || !body.amount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: bookingId, guestName, propertyName, amount' 
        },
        { status: 400 }
      );
    }
    
    // Create new payment transaction
    const newTransaction = paymentManager.addTransaction({
      bookingId: body.bookingId,
      guestName: body.guestName,
      propertyName: body.propertyName,
      amount: body.amount,
      currency: body.currency || 'INR',
      status: 'Pending',
      paymentMethod: body.paymentMethod || 'Razorpay',
      retryCount: 0,
      maxRetries: 3
    });
    
    return NextResponse.json({
      success: true,
      data: newTransaction,
      message: 'Payment transaction created successfully'
    });
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create payment transaction' 
      },
      { status: 500 }
    );
  }
}

