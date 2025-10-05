import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/services/CustomerService';
import { requireAuth } from '@/lib/utils/requireAuth';
import { internalErrorResponse, successResponse } from '@/lib/utils/response';

/**
 * GET /api/customers/stats
 * Get customer statistics (total count, etc.)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    const count = await customerService.getCustomerCount(auth.user!.userId);
    return successResponse({ totalCustomers: count }, 'Statistics retrieved successfully');
  } catch (error) {
    console.error('Get customer stats error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to get stats');
  }
}
