import { NextRequest, NextResponse } from 'next/server';
import { customerController } from '@/lib/controllers/CustomerController';

/**
 * GET /api/customers/stats
 * Get customer statistics (total count, etc.)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return customerController.getStats(request);
}
