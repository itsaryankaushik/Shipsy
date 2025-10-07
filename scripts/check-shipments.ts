import 'dotenv/config';
import { db } from '../lib/db/index.js';
import { shipments } from '../lib/db/schema.js';
import { isNull } from 'drizzle-orm';

async function checkShipments() {
  console.log('Checking shipments in database...\n');

  // Get all shipments
  const allShipments = await db.select().from(shipments);
  console.log(`Total shipments: ${allShipments.length}\n`);

  if (allShipments.length === 0) {
    console.log('No shipments found in database.');
    process.exit(0);
  }

  // Check for NULL estimated delivery dates
  const nullEstimatedDates = await db
    .select()
    .from(shipments)
    .where(isNull(shipments.estimatedDeliveryDate));

  console.log(`Shipments with NULL estimatedDeliveryDate: ${nullEstimatedDates.length}\n`);

  // Show sample data
  console.log('Sample shipments (first 5):');
  allShipments.slice(0, 5).forEach((s, i) => {
    console.log(`\n${i + 1}. Shipment ${s.id.slice(0, 8)}...`);
    console.log(`   Type: ${s.type} | Mode: ${s.mode}`);
    console.log(`   Is Delivered: ${s.isDelivered}`);
    console.log(`   Estimated Delivery: ${s.estimatedDeliveryDate || 'NULL'}`);
    console.log(`   Actual Delivery: ${s.deliveryDate || 'NULL'}`);
    console.log(`   Created: ${s.createdAt}`);
  });

  process.exit(0);
}

checkShipments().catch((error) => {
  console.error('Error checking shipments:', error);
  process.exit(1);
});
