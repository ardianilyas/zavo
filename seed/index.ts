
import { db } from "../db";
import { creator, donation, ledgerTransaction, user, session, account, paymentLog } from "../db/schema";
import { eq, ne } from "drizzle-orm";
import { subDays } from "date-fns";
import { randomUUID } from "crypto";
import { auth } from "../lib/auth";

const TARGET_USERNAME = "ardianilyas";
const SAFE_EMAIL = "ardian@zavo.com";

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
  "Donation for the cause.",
  "You're the best!",
  "Enjoy the coffee ☕",
  "Sending love from Indonesia 🇮🇩",
  "Semangat bang!",
  "Gas terus!",
];

const FIRST_NAMES = [
  "John", "Jane", "Alice", "Bob", "Charlie", "Diana", "Frank", "Grace", "Henry", "Ivy",
  "Jack", "Kelly", "Liam", "Mona", "Nathan", "Olivia", "Peter", "Quinn", "Rachel", "Steve"
];
const LAST_NAMES = [
  "Doe", "Smith", "Johnson", "Brown", "Davis", "Evans", "Green", "Hill", "Irwin", "Jones",
  "Klein", "Lopez", "Moore", "Nolan", "O'Connor", "Parker", "Quigley", "Roberts", "Scott", "Taylor"
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
    // 1. Find Target Creator & Safe User
    const targetCreator = await db.query.creator.findFirst({
      where: eq(creator.username, TARGET_USERNAME),
    });

    if (!targetCreator) {
      console.error(`❌ Creator with username '${TARGET_USERNAME}' not found.`);
      process.exit(1);
    }

    const safeUser = await db.query.user.findFirst({
      where: eq(user.email, SAFE_EMAIL),
    });

    if (!safeUser) {
      console.error(`❌ Safe user '${SAFE_EMAIL}' not found. Seeding aborted to prevent data loss.`);
      process.exit(1);
    }

    console.log(`✅ Found creator: ${targetCreator.name} (${targetCreator.id})`);
    console.log(`✅ Identified safe user: ${safeUser.email} (${safeUser.id})`);

    // 2. CLEANUP
    console.log("🧹 Cleaning up old data...");

    // Delete all ledger transactions
    await db.delete(ledgerTransaction);
    // Delete payment logs (FK constraint)
    await db.delete(paymentLog);
    // Delete all donations
    await db.delete(donation);

    // Delete sessions and accounts for non-safe users
    await db.delete(session).where(ne(session.userId, safeUser.id));
    await db.delete(account).where(ne(account.userId, safeUser.id));

    // Delete users who are not the safe user
    await db.delete(user).where(ne(user.id, safeUser.id));

    // Reset Creator Balance
    await db.update(creator)
      .set({ balance: 0 })
      .where(eq(creator.id, targetCreator.id));

    console.log("✅ Cleanup complete.");

    // 3. Generate Users and Donations
    const NUM_DONATIONS = 100;
    const donationsToInsert = [];
    const ledgerEntries = [];
    let totalAddedBalance = 0;

    console.log(`👥 Creating ${NUM_DONATIONS} users and generating donations...`);

    for (let i = 0; i < NUM_DONATIONS; i++) {
      const firstName = getRandomElement(FIRST_NAMES);
      const lastName = getRandomElement(LAST_NAMES);
      const donorName = `${firstName} ${lastName}`;
      const donorEmail = `donor_${i}_${randomUUID().slice(0, 8)}@example.com`;
      const donorPassword = "password123";

      // Create User via Better Auth
      // Using auth.api.signUpEmail directly
      let newUser;
      try {
        const res = await auth.api.signUpEmail({
          body: {
            email: donorEmail,
            password: donorPassword,
            name: donorName,
            username: `user_${i}_${randomUUID().slice(0, 8)}`,
            bio: "Seed user bio",
            streamToken: randomUUID(),
          }
        });
        newUser = res.user;
      } catch (e: any) {
        // If headers are missing/mocking issue, fallback to DB insert could be discussed, 
        // but 'better-auth' usually handles this if database is connected.
        console.error(`Failed to create user ${donorEmail}:`, e.message || e);
        continue;
      }

      if (!newUser || !newUser.id) {
        console.warn(`User creation returned no user for ${donorEmail}`);
        continue;
      }

      const isPaid = Math.random() > 0.1; // 90% paid
      const status = isPaid ? "PAID" as const : "PENDING" as const;
      const amount = getRandomInt(10000, 500000); // 10k to 500k

      // Random date within last 3 months (90 days)
      const daysAgo = getRandomInt(0, 90);
      const createdAt = subDays(new Date(), daysAgo);
      createdAt.setHours(getRandomInt(0, 23), getRandomInt(0, 59), getRandomInt(0, 59));

      const paidAt = isPaid ? new Date(createdAt.getTime() + 1000 * 60 * getRandomInt(1, 60)) : null;
      const donationId = randomUUID();

      donationsToInsert.push({
        id: donationId,
        recipientId: targetCreator.id,
        donorId: newUser.id,
        donorName: donorName,
        donorEmail: donorEmail,
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
          description: `Donation from ${donorName}`,
          referenceId: donationId,
          referenceType: "DONATION" as const,
          status: "COMPLETED" as const,
          createdAt: paidAt!,
        });
      }

      if ((i + 1) % 10 === 0) {
        process.stdout.write(`.`);
      }
    }
    console.log(`\n✅ Generated data.`);

    // 4. Insert Batch Data
    if (donationsToInsert.length > 0) {
      console.log(`📝 Inserting ${donationsToInsert.length} donations...`);
      await db.insert(donation).values(donationsToInsert);
    }

    if (ledgerEntries.length > 0) {
      console.log(`📝 Inserting ${ledgerEntries.length} ledger transactions...`);
      await db.insert(ledgerTransaction).values(ledgerEntries);

      // 5. Update Balance
      console.log(`💰 Updating balance (+${totalAddedBalance})...`);

      await db.update(creator)
        .set({
          balance: totalAddedBalance,
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
