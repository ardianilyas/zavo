
import { db } from "../db";
import { creator, donation, ledgerTransaction } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { subDays, subMonths } from "date-fns";
import { randomUUID } from "crypto";

const TARGET_USERNAME = "ardianilyas";

const DONOR_NAMES = [
  "John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Charlie Davis",
  "Diana Evans", "Frank Green", "Grace Hill", "Henry Irwin", "Ivy Jones",
  "Kevin King", "Laura Lee", "Mike Miller", "Nancy Nelson", "Oscar Owens"
];

const MESSAGES = [
  "Keep up the good work!",
  "Love your content!",
  "Here is a coffee for you.",
  "Great stream!",
  "Support from a fan.",
  "Amazing effort.",
  "Can you say hi?",
  "Testing donation.",
  "Just passing by.",
  "Donation for the cause."
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log(`🌱 Seeding data for user: ${TARGET_USERNAME}...`);

  try {
    // 1. Find Creator
    const targetCreator = await db.query.creator.findFirst({
      where: eq(creator.username, TARGET_USERNAME),
    });

    if (!targetCreator) {
      console.error(`❌ Creator with username '${TARGET_USERNAME}' not found.`);
      process.exit(1);
    }

    console.log(`✅ Found creator: ${targetCreator.name} (${targetCreator.id})`);

    // 2. Generate Donations
    const NUM_DONATIONS = 100;
    const donationsToInsert = [];
    const ledgerEntries = [];
    let totalAddedBalance = 0;

    for (let i = 0; i < NUM_DONATIONS; i++) {
      const isPaid = Math.random() > 0.1; // 90% paid
      const status = isPaid ? "PAID" as const : "PENDING" as const;
      const amount = getRandomInt(10000, 500000); // 10k to 500k
      // Random date within last 3 months
      const daysAgo = getRandomInt(0, 90);
      const createdAt = subDays(new Date(), daysAgo);

      // Add random time variation
      createdAt.setHours(getRandomInt(0, 23), getRandomInt(0, 59), getRandomInt(0, 59));

      const paidAt = isPaid ? new Date(createdAt.getTime() + 1000 * 60 * getRandomInt(1, 60)) : null; // Paid 1-60 mins later
      const donationId = randomUUID();

      donationsToInsert.push({
        id: donationId,
        recipientId: targetCreator.id,
        donorName: getRandomElement(DONOR_NAMES),
        donorEmail: `donor${i}@example.com`,
        amount: amount,
        message: getRandomElement(MESSAGES),
        status: status,
        externalId: `seed-${randomUUID()}`,
        xenditId: `mock-qr-${randomUUID()}`,
        createdAt: createdAt,
        paidAt: paidAt,
      });

      if (isPaid) {
        totalAddedBalance += amount;
        ledgerEntries.push({
          creatorId: targetCreator.id,
          type: "CREDIT" as const,
          amount: amount,
          description: `Donation from ${donationsToInsert[i].donorName}`,
          referenceId: donationId,
          referenceType: "DONATION" as const,
          status: "COMPLETED" as const,
          createdAt: paidAt!,
        });
      }
    }

    // 3. Insert in batches
    console.log(`📝 Inserting ${donationsToInsert.length} donations...`);
    await db.insert(donation).values(donationsToInsert);

    if (ledgerEntries.length > 0) {
      console.log(`📝 Inserting ${ledgerEntries.length} ledger transactions...`);
      await db.insert(ledgerTransaction).values(ledgerEntries);

      // 4. Update Balance
      console.log(`💰 Updating balance (+${totalAddedBalance})...`);
      await db.update(creator)
        .set({
          balance: sql`${creator.balance} + ${totalAddedBalance}`,
          updatedAt: new Date(),
        })
        .where(eq(creator.id, targetCreator.id));
    }

    console.log("✅ Seeding completed successfully!");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
