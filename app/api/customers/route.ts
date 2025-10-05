import { NextRequest, NextResponse } from 'next/server';
import { customerController } from '@/lib/controllers/CustomerController';

/**
 * GET /api/customers
 * List all customers with pagination
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return customerController.list(request);
}

/**
 * POST /api/customers
 * Create a new customer
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return customerController.create(request);
}
