"use server";

import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { eq } from "drizzle-orm";
import { getUserIdTag } from "./db-cache";
import { db } from "@/src/drizzle/db";
import { UserTable } from "@/src/drizzle/schema";

export async function getUser(id: string) {
  "use cache";
  cacheTag(getUserIdTag(id));

  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  });
}
