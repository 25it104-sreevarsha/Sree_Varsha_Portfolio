import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { ensurePortfolioSchemaAndSeed, getContactMessages } from "@/lib/portfolio-service";
import { eq } from "drizzle-orm";

const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || "signature-2026";

export async function GET(req: NextRequest) {
  try {
    const passkey = req.headers.get("x-admin-passkey");
    if (passkey !== ADMIN_PASSKEY) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }
    const messages = await getContactMessages();
    return NextResponse.json({ status: "ok", messages });
  } catch (error) {
    console.error("Failed to fetch contact messages:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensurePortfolioSchemaAndSeed();
    const body = await req.json();

    const senderName = String(body.name || "").trim();
    const senderEmail = String(body.email || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!senderName || !senderEmail || !subject || !message) {
      return NextResponse.json(
        {
          status: "error",
          message: "Please complete all fields (Name, Email, Subject, and Message).",
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return NextResponse.json(
        { status: "error", message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const [inserted] = await db
      .insert(contactMessages)
      .values({
        senderName,
        senderEmail,
        subject,
        message,
        status: "unread",
      })
      .returning();

    return NextResponse.json({
      status: "ok",
      message:
        "Your message has been securely recorded in the portfolio database. The owner will respond via email.",
      receipt: {
        id: inserted.id,
        createdAt: inserted.createdAt,
      },
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Unable to dispatch message right now. Please use the direct email link.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const passkey = req.headers.get("x-admin-passkey");
    if (passkey !== ADMIN_PASSKEY) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }
    const { id, status } = await req.json();
    await db
      .update(contactMessages)
      .set({ status: status || "read" })
      .where(eq(contactMessages.id, Number(id)));
    const messages = await getContactMessages();
    return NextResponse.json({ status: "ok", messages });
  } catch (error) {
    console.error("Failed to update message status:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to update message" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const passkey = req.headers.get("x-admin-passkey");
    if (passkey !== ADMIN_PASSKEY) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    if (id) {
      await db.delete(contactMessages).where(eq(contactMessages.id, id));
    }
    const messages = await getContactMessages();
    return NextResponse.json({ status: "ok", messages });
  } catch (error) {
    console.error("Failed to delete contact message:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to delete message" },
      { status: 500 }
    );
  }
}
