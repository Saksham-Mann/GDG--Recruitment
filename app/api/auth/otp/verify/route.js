import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAndConsumeOtp } from "@/lib/email-otp";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { parseSafeJson } from "@/lib/body-guard";

export const dynamic = "force-dynamic";

const verifyOtpSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Verification code must be exactly 6 digits."),
});

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const ipLimit = rateLimit(`otp_verify_ip_${ip}`, { limit: 20, windowMs: 15 * 60 * 1000 });
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please try again later." },
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

    const parseResult = verifyOtpSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || "Invalid input parameters.";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const { email, otp } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const result = await verifyAndConsumeOtp(normalizedEmail, otp);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          remainingAttempts: result.remainingAttempts,
          expired: result.expired,
          maxAttemptsExceeded: result.maxAttemptsExceeded,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Email verified successfully.",
        verified: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in OTP verify route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while verifying the code." },
      { status: 500 }
    );
  }
}
