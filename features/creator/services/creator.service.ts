import { db } from "@/db";
import { creator } from "@/db/schema";
import { eq } from "drizzle-orm";

export class CreatorService {
  static async getProfileByUserId(userId: string) {
    return await db.query.creator.findFirst({
      where: eq(creator.userId, userId)
    });
  }

  static async getProfileByUsername(username: string) {
    return await db.query.creator.findFirst({
      where: eq(creator.username, username)
    });
  }

  static async getProfileByStreamToken(token: string) {
    return await db.query.creator.findFirst({
      where: eq(creator.streamToken, token)
    });
  }
}
