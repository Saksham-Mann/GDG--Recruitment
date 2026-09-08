import { NextResponse } from "next/server";
import { z } from "zod";
import { createAndSendOtp } from "@/lib/email-otp";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { parseSafeJson } from "@/lib/body-guard";
import { connect } from "@/lib/db";

export const dynamic = "force-dynamic";

const resendOtpSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
});

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const ipLimit = rateLimit(`otp_resend_ip_${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many resend attempts. Please wait before trying again." },
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

    const parseResult = resendOtpSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || "Invalid email address.";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const { email } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Verify user exists and is not already verified
    const db = await connect();
    const userSnap = await db.collection("user").where("email", "==", normalizedEmail).get();
    if (userSnap.empty) {
      return NextResponse.json(
        { error: "No account found with this email address." },
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
        { error: result.error || "Failed to resend verification code." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "A fresh verification code has been sent to your email.",
        expiresIn: result.expiresIn,
        resendCooldown: result.resendCooldown,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in OTP resend route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while resending the code." },
      { status: 500 }
    );
  }
}
