import 'dotenv/config';
import { db } from '../lib/db';
import { shipments } from '../lib/db/schema';
import { isNull, sql } from 'drizzle-orm';

async function updateEstimatedDates() {
  try {
    console.log('Updating NULL estimated_delivery_date values...');
    console.log('Setting dates to future (after October 8, 2025)...');
    
    // Set estimated delivery date to a future date (between 10-45 days from now)
    // This ensures all dates are after October 8, 2025
    const result = await db
      .update(shipments)
      .set({
        estimatedDeliveryDate: sql`NOW() + INTERVAL '10 days' + (RANDOM() * INTERVAL '35 days')`,
      })
      .where(isNull(shipments.estimatedDeliveryDate));

    console.log('✅ Successfully updated estimated delivery dates to future dates!');
    console.log('All dates are now set between October 18-November 22, 2025');
    console.log('Updated rows:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating dates:', error);
    process.exit(1);
  }
}

updateEstimatedDates();
