import { deleteUser, upsertUser } from "@/src/features/users/db";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);

    switch (event.type) {
      case "user.created":
      case "user.updated":
        const clerkData = event.data;
        const email = clerkData.email_addresses.find(
          (email) => email.id === clerkData.primary_email_address_id,
        )?.email_address;

        if (!email) {
          return new Response("Primary email not found", { status: 400 });
        }

        await upsertUser({
          id: clerkData.id,
          email,
          name: `${clerkData.first_name} ${clerkData.last_name}`,
          imageUrl: clerkData.image_url,
          createdAt: new Date(clerkData.created_at),
          updatedAt: new Date(clerkData.updated_at),
        });

        break;
      case "user.deleted":
        if (event.data.id === null || event.data.id === undefined) {
          return new Response("User ID not found", { status: 400 });
        }

        await deleteUser(event.data.id);

        break;
      default:
        return new Response("Event type not handled", { status: 400 });
    }
    // Handle user creation event
  } catch {
    return new Response("Invalid webhook", { status: 400 });
  }

  return new Response("Webhook received", { status: 200 });
}
