import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/lib/services/CustomerService';
import { bulkDeleteCustomersSchema } from '@/lib/validators';
import { requireAuth } from '@/lib/utils/requireAuth';
import { validationErrorResponse, internalErrorResponse, successResponse } from '@/lib/utils/response';

/**
 * DELETE /api/customers/bulk
 * Bulk delete customers by IDs
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) return auth.response!;

    const body = await request.json();
    const parsed = bulkDeleteCustomersSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    const deletedCount = await customerService.bulkDeleteCustomers(parsed.data.ids, auth.user!.userId);

    return successResponse({ deleted: deletedCount }, `Successfully deleted ${deletedCount} customer(s)`);
  } catch (error) {
    console.error('Bulk delete customers error', error);
    return internalErrorResponse((error as Error)?.message || 'Failed to bulk delete customers');
  }
}
