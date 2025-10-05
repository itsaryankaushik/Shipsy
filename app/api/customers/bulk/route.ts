import { NextRequest, NextResponse } from 'next/server';
import { customerController } from '@/lib/controllers/CustomerController';

/**
 * DELETE /api/customers/bulk
 * Bulk delete customers by IDs
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  return customerController.bulkDelete(request);
}
