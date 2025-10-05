/**
 * Database Seed Script
 * 
 * Seeds the database with:
 * - 5 test user accounts
 * - 15-25 customers per user (varying)
 * - 0-3 shipments per customer (random distribution)
 * 
 * Run with: bun run db:seed
 */

// IMPORTANT: Load environment variables BEFORE importing db
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env file
const envPath = path.join(process.cwd(), ".env");
// const sampleEnvPath = path.join(process.cwd(), "sample.env");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ Loaded environment from .env file\n");
} else {
  console.error("❌ Error: .env file not found!");
  console.error("\n📝 To fix this:");
  console.error("  1. Copy sample.env to .env:");
  console.error("     PowerShell: Copy-Item sample.env .env");
  console.error("     Bash: cp sample.env .env");
  console.error("\n  2. Edit .env and add your DATABASE_URL from Neon:");
  console.error("     DATABASE_URL=postgres://user:password@host/database");
  console.error("\n  3. Run the seed script again: bun run db:seed\n");
  process.exit(1);
}

// Validate environment variables
if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not set in .env file!");
  console.error("\n📝 To fix this:");
  console.error(`  1. Open .env file in your editor`);
  console.error("  2. Add your Neon database connection string:");
  console.error("     DATABASE_URL=postgres://user:password@host/database");
  console.error("\n  3. Get your DATABASE_URL from:");
  console.error("     - Neon Dashboard → Your Project → Connection String");
  console.error("\n  4. Run the seed script again: bun run db:seed\n");
  process.exit(1);
}

// Now import db after environment is loaded
// import { db } from './index';
import { users, customers, shipments } from './schema';
import { hashPassword } from '../utils/auth';

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";


const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
/*
 * Sometimes you might want to run raw SQL queries instead of using the ORM.
 * import { sql } from './db';
 * const result = await sql`SELECT * FROM files WHERE user_id = ${userId}`;
 */
export { sql };

// Seed configuration
const USERS_COUNT = 5;
const MIN_CUSTOMERS_PER_USER = 15;
const MAX_CUSTOMERS_PER_USER = 25;
const MAX_SHIPMENTS_PER_CUSTOMER = 3; // 0-3 shipments per customer

// Sample data pools
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Lisa', 'James', 'Mary', 'Robert', 'Patricia', 'William', 'Jennifer', 'Richard', 'Linda', 'Joseph', 'Elizabeth'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor'];
const companies = ['Tech Corp', 'Global Industries', 'Digital Solutions', 'Innovation Labs', 'Future Systems', 'Smart Enterprises', 'Elite Services', 'Prime Logistics', 'Advanced Manufacturing', 'Precision Tools'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Mumbai', 'Delhi', 'Bangalore', 'London', 'Paris', 'Tokyo', 'Sydney', 'Toronto'];
const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'NC', 'GA'];
const shipmentTypes: ('LOCAL' | 'NATIONAL' | 'INTERNATIONAL')[] = ['LOCAL', 'NATIONAL', 'INTERNATIONAL'];
const shipmentModes: ('AIR' | 'WATER' | 'LAND')[] = ['AIR', 'WATER', 'LAND'];

// Helper functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePhone(): string {
  return `+1${randomInt(200, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}`;
}

function generateEmail(firstName: string, lastName: string, domain: string = 'example.com'): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

function generateAddress(): string {
  return `${randomInt(100, 9999)} ${randomElement(['Main', 'Oak', 'Maple', 'Cedar', 'Elm', 'Pine'])} ${randomElement(['St', 'Ave', 'Blvd', 'Rd', 'Lane'])}`;
}

function generateCost(): string {
  return (Math.random() * 900 + 100).toFixed(2); // $100 - $1000
}

function generateCalculatedTotal(cost: string, taxPercent: number = randomInt(5, 15)): string {
  const costNum = parseFloat(cost);
  const total = costNum * (1 + taxPercent / 100);
  return total.toFixed(2);
}

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Clear existing data (optional - comment out if you want to append)
    // console.log('🗑️  Clearing existing data...');
    // await db.delete(shipments);
    // await db.delete(customers);
    // await db.delete(users);
    // console.log('✅ Existing data cleared\n');

    // Create test users
    console.log(`👤 Creating ${USERS_COUNT} test users...`);
    const createdUsers = [];
    
    for (let i = 1; i <= USERS_COUNT; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const email = `testuser${i}@shipsy.com`;
      const password = await hashPassword('password123'); // All test users have same password

      const [user] = await db.insert(users).values({
        email,
        passwordHash: password,
        name: `${firstName} ${lastName}`,
        phone: generatePhone(),
      }).returning();

      createdUsers.push(user);
      console.log(`  ✓ Created user: ${user.email} (password: password123)`);
    }
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Create customers and shipments for each user
    let totalCustomers = 0;
    let totalShipments = 0;

    for (const user of createdUsers) {
      const customerCount = randomInt(MIN_CUSTOMERS_PER_USER, MAX_CUSTOMERS_PER_USER);
      console.log(`👥 Creating ${customerCount} customers for ${user.email}...`);

      for (let i = 0; i < customerCount; i++) {
        const firstName = randomElement(firstNames);
        const lastName = randomElement(lastNames);
        
        const [customer] = await db.insert(customers).values({
          userId: user.id,
          name: `${firstName} ${lastName}`,
          email: generateEmail(firstName, lastName, randomElement(['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'])),
          phone: generatePhone(),
          address: generateAddress(),
        }).returning();

        totalCustomers++;

        // Create 0-3 random shipments for this customer
        const shipmentCount = randomInt(0, MAX_SHIPMENTS_PER_CUSTOMER);
        
        if (shipmentCount > 0) {
          for (let j = 0; j < shipmentCount; j++) {
            const type = randomElement(shipmentTypes);
            const mode = randomElement(shipmentModes);
            const cost = generateCost();
            const calculatedTotal = generateCalculatedTotal(cost);
            const isDelivered = Math.random() > 0.4; // 60% delivered, 40% pending
            const createdDate = randomDate(new Date(2024, 0, 1), new Date());
            const deliveryDate = isDelivered 
              ? randomDate(createdDate, new Date())
              : randomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Future date for pending

            const startCity = randomElement(cities);
            const endCity = randomElement(cities.filter(c => c !== startCity));

            await db.insert(shipments).values({
              userId: user.id,
              customerId: customer.id,
              type,
              mode,
              startLocation: `${startCity}, ${randomElement(states)}`,
              endLocation: `${endCity}, ${randomElement(states)}`,
              cost,
              calculatedTotal,
              isDelivered,
              deliveryDate: isDelivered ? deliveryDate : null,
              createdAt: createdDate,
              updatedAt: isDelivered ? deliveryDate : createdDate,
            });

            totalShipments++;
          }
        }
      }
      console.log(`  ✓ Created ${customerCount} customers with shipments for ${user.email}`);
    }

    console.log(`\n✅ Seed completed successfully!\n`);
    console.log('📊 Summary:');
    console.log(`  - Users: ${createdUsers.length}`);
    console.log(`  - Customers: ${totalCustomers}`);
    console.log(`  - Shipments: ${totalShipments}`);
    console.log('\n🔑 Test Credentials:');
    createdUsers.forEach((user, i) => {
      console.log(`  ${i + 1}. Email: ${user.email} | Password: password123`);
    });
    console.log('\n🚀 You can now login with any of these accounts!\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run seed
seed()
  .then(() => {
    console.log('✨ Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seed script failed:', error);
    process.exit(1);
  });
