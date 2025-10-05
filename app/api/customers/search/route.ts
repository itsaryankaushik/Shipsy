import { NextRequest, NextResponse } from 'next/server';
import { customerController } from '@/lib/controllers/CustomerController';

/**
 * GET /api/customers/search
 * Search customers by query string
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return customerController.search(request);
}
