import { NextResponse } from "next/server";
import { z } from "zod";
import { createAndSendOtp } from "@/lib/email-otp";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { parseSafeJson } from "@/lib/body-guard";
import { connect } from "@/lib/db";

export const dynamic = "force-dynamic";

const sendOtpSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
});

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const ipLimit = rateLimit(`otp_send_ip_${ip}`, { limit: 15, windowMs: 15 * 60 * 1000 });
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many verification requests. Please try again later." },
        { status: 429 }
      );
    }

    let rawBody;
    try {
      rawBody = await parseSafeJson(req, 10 * 1024);
    } catch {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const parseResult = sendOtpSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || "Invalid email address.";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const { email } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const emailLimit = rateLimit(`otp_send_email_${normalizedEmail}`, {
      limit: 6,
      windowMs: 15 * 60 * 1000,
    });
    if (!emailLimit.success) {
      return NextResponse.json(
        { error: "Too many verification attempts for this email. Please wait a few minutes." },
        { status: 429 }
      );
    }

    // Verify user exists
    const db = await connect();
    const userSnap = await db.collection("user").where("email", "==", normalizedEmail).get();
    if (userSnap.empty) {
      return NextResponse.json(
        { error: "No account found with this email address. Please create an account first." },
        { status: 404 }
      );
    }

    const userData = userSnap.docs[0].data();
    if (userData.emailVerified === true) {
      return NextResponse.json(
        { message: "Account is already verified. You can sign in.", alreadyVerified: true },
        { status: 200 }
      );
    }

    const result = await createAndSendOtp(normalizedEmail);

    if (!result.success) {
      if (result.rateLimited) {
        return NextResponse.json(
          { error: result.error, waitSeconds: result.waitSeconds },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: result.error || "Failed to generate verification code." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Verification code sent to your email address.",
        expiresIn: result.expiresIn,
        resendCooldown: result.resendCooldown,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in OTP send route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while sending verification code." },
      { status: 500 }
    );
  }
}
