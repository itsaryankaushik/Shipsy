import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/services/CustomerService';
import { searchCustomerSchema } from '@/lib/validators';
import { requireAuth } from '@/lib/utils/requireAuth';
import { validationErrorResponse, internalErrorResponse, successResponse } from '@/lib/utils/response';

/**
 * GET /api/customers/search
 * Search customers by query string
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    const url = new URL(request.url);
    const params: Record<string, string> = {};
    url.searchParams.forEach((v, k) => (params[k] = v));

    const parsed = searchCustomerSchema.safeParse(params);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const customers = await customerService.searchCustomers(auth.user!.userId, parsed.data.query);
    return successResponse(customers, 'Search completed successfully');
  } catch (error) {
    console.error('Search customers error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to search customers');
  }
}
