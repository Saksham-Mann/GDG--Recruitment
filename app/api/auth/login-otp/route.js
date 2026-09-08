import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createAndSendOtp } from "@/lib/email-otp";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { parseSafeJson } from "@/lib/body-guard";

export const dynamic = "force-dynamic";

const loginOtpSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const ipLimit = rateLimit(`login_otp_ip_${ip}`, { limit: 15, windowMs: 15 * 60 * 1000 });
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    let rawBody;
    try {
      rawBody = await parseSafeJson(req, 10 * 1024);
    } catch {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const parseResult = loginOtpSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0]?.message || "Invalid input parameters.";
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    const { connect } = await import("@/lib/db");
    const { verifyPassword } = await import("better-auth/crypto");
    const db = await connect();

    let userSnap = await db.collection("users").where("email", "==", normalizedEmail).get();
    if (userSnap.empty) {
      userSnap = await db.collection("user").where("email", "==", normalizedEmail).get();
    }

    if (userSnap.empty) {
      return NextResponse.json(
        { error: "Invalid email or password. Please verify your credentials or sign up." },
        { status: 401 }
      );
    }

    const userDoc = userSnap.docs[0];
    const userId = userDoc.id;

    let accountSnap = await db
      .collection("accounts")
      .where("userId", "==", userId)
      .where("providerId", "==", "credential")
      .get();

    if (accountSnap.empty) {
      accountSnap = await db
        .collection("account")
        .where("userId", "==", userId)
        .where("providerId", "==", "credential")
        .get();
    }

    if (accountSnap.empty) {
      return NextResponse.json(
        {
          error:
            "No password found for this account. If you originally signed up with Google, please log in with Google.",
        },
        { status: 401 }
      );
    }

    const accountData = accountSnap.docs[0].data();
    if (!accountData.password) {
      return NextResponse.json(
        {
          error:
            "No password found for this account. If you originally signed up with Google, please log in with Google.",
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword({
      hash: accountData.password,
      password,
    });

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password. Please verify your credentials or sign up." },
        { status: 401 }
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
        message: result.devMode
          ? "Verification code generated in development mode."
          : "Verification code sent to your email address.",
        expiresIn: result.expiresIn,
        resendCooldown: result.resendCooldown,
        devMode: result.devMode,
        devOtp: result.devOtp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in login OTP initiate route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
