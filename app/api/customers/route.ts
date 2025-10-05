import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/services/CustomerService';
import { listCustomersSchema, createCustomerSchema } from '@/lib/validators';
import { requireAuth } from '@/lib/utils/requireAuth';
import { validationErrorResponse, internalErrorResponse, successResponse } from '@/lib/utils/response';

/**
 * GET /api/customers
 * List all customers with pagination
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Require authentication
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return auth.response!;
    }

    // Parse query params
    const url = new URL(request.url);
    const params: Record<string, string> = {};
    url.searchParams.forEach((v, k) => (params[k] = v));

    const page = params.page ? parseInt(params.page, 10) : 1;
    const limit = Math.min(params.limit ? parseInt(params.limit, 10) : 20, 100);

    const result = await customerService.getCustomersByUser(auth.user!.userId, {
      page,
      limit,
      search: params.search,
      sortBy: params.sortBy || 'createdAt',
      sortOrder: (params.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    });

    // Normalize to paginated shape expected by frontend: { items, meta }
    const payload = { items: result.customers, meta: result.meta };
    return successResponse(payload, 'Customers retrieved successfully');
  } catch (error) {
    console.error('List customers error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to list customers');
  }
}

/**
 * POST /api/customers
 * Create a new customer
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return auth.response!;
    }

    const body = await request.json();
    const parsed = createCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const customer = await customerService.createCustomer(auth.user!.userId, parsed.data);

    return NextResponse.json({ success: true, message: 'Customer created successfully', data: customer }, { status: 201 });
  } catch (error) {
    console.error('Create customer error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to create customer');
  }
}
