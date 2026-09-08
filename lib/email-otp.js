import crypto from "crypto";
import nodemailer from "nodemailer";
import { connect } from "@/lib/db";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 3;

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.EMAIL_USERNAME?.trim();
  const pass = process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s+/g, "") : null;

  if (user && pass) {
    cachedTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  return cachedTransporter;
}

export function generateNumericOtp(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length);
  return crypto.randomInt(min, max).toString();
}

export function hashOtp(otp, salt) {
  const secret = process.env.BETTER_AUTH_SECRET || "gdg-recruitment-otp-secret";
  return crypto
    .createHash("sha256")
    .update(`${otp}:${salt}:${secret}`)
    .digest("hex");
}

export function verifyOtpHash(inputOtp, salt, storedHash) {
  try {
    const computed = hashOtp(inputOtp, salt);
    const computedBuffer = Buffer.from(computed, "hex");
    const storedBuffer = Buffer.from(storedHash, "hex");

    if (computedBuffer.length !== storedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuffer, storedBuffer);
  } catch {
    return false;
  }
}

export async function sendOtpEmail(recipientEmail, otp) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      `[DEV-OTP] Verification code for ${recipientEmail}: ${otp} (valid for 10 minutes)`
    );
    return { delivered: true, devMode: true };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification Code</title>
      </head>
      <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 8px;">GDG Recruitment Portal</h1>
            <p style="color: #a1a1aa; font-size: 14px; margin: 0;">Email Verification</p>
          </div>
          
          <div style="background-color: #27272a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #d4d4d8; font-size: 14px; margin: 0 0 12px;">Your 6-digit verification code is:</p>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #3b82f6; font-family: monospace; padding: 8px 0;">
              ${otp}
            </div>
            <p style="color: #71717a; font-size: 12px; margin: 12px 0 0;">Valid for 10 minutes</p>
          </div>

          <p style="color: #a1a1aa; font-size: 13px; line-height: 1.6; margin: 0 0 16px;">
            Enter this code directly on the recruitment verification page to activate your account. Do not share this code with anyone.
          </p>

          <div style="border-top: 1px solid #27272a; padding-top: 16px; margin-top: 24px; text-align: center;">
            <p style="color: #71717a; font-size: 11px; margin: 0;">
              If you did not request this verification, you can safely ignore this message.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: `"GDG Recruitment" <${process.env.EMAIL_USERNAME}>`,
    to: recipientEmail,
    subject: `Your GDG Verification Code: ${otp}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { delivered: true, devMode: false };
  } catch (err) {
    console.error("Failed to send verification email via Nodemailer:", err);
    console.log(
      `[DEV-OTP-FALLBACK] Verification code for ${recipientEmail}: ${otp} (valid for 10 minutes)`
    );
    return { delivered: false, devMode: true, error: err.message };
  }
}

export async function createAndSendOtp(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await connect();
  const otpRef = db.collection("otp_verifications").doc(normalizedEmail);

  // Check existing record for rate-limiting
  const existingSnap = await otpRef.get();
  if (existingSnap.exists) {
    const data = existingSnap.data();
    if (data.resendAfter && Date.now() < data.resendAfter) {
      const waitSeconds = Math.ceil((data.resendAfter - Date.now()) / 1000);
      return {
        success: false,
        rateLimited: true,
        waitSeconds,
        error: `Please wait ${waitSeconds} seconds before requesting a new code.`,
      };
    }
  }

  const otp = generateNumericOtp(6);
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedOtp = hashOtp(otp, salt);
  const now = Date.now();

  const record = {
    email: normalizedEmail,
    hashedOtp,
    salt,
    expiresAt: now + OTP_EXPIRY_MS,
    resendAfter: now + RESEND_COOLDOWN_MS,
    attempts: 0,
    createdAt: now,
  };

  await otpRef.set(record);
  const emailResult = await sendOtpEmail(normalizedEmail, otp);

  return {
    success: true,
    expiresIn: OTP_EXPIRY_MS / 1000,
    resendCooldown: RESEND_COOLDOWN_MS / 1000,
    devMode: emailResult?.devMode ?? false,
    devOtp: emailResult?.devMode ? otp : undefined,
  };
}

export async function verifyAndConsumeOtp(email, inputOtp) {
  const normalizedEmail = email.toLowerCase().trim();
  const db = await connect();
  const otpRef = db.collection("otp_verifications").doc(normalizedEmail);

  const snap = await otpRef.get();
  if (!snap.exists) {
    return {
      success: false,
      error: "No pending verification found. Please request a new code.",
    };
  }

  const data = snap.data();

  // Check expiration
  if (Date.now() > data.expiresAt) {
    await otpRef.delete();
    return {
      success: false,
      expired: true,
      error: "Verification code has expired. Please request a new code.",
    };
  }

  // Check attempt limit
  if (data.attempts >= MAX_ATTEMPTS) {
    await otpRef.delete();
    return {
      success: false,
      maxAttemptsExceeded: true,
      error: "Maximum attempts exceeded. This verification code has been invalidated. Please request a new code.",
    };
  }

  const isValid = verifyOtpHash(inputOtp.trim(), data.salt, data.hashedOtp);

  if (!isValid) {
    const newAttempts = (data.attempts || 0) + 1;
    if (newAttempts >= MAX_ATTEMPTS) {
      await otpRef.delete();
      return {
        success: false,
        maxAttemptsExceeded: true,
        error: "Incorrect code. Maximum attempts reached. Code has been invalidated. Please request a new code.",
      };
    } else {
      await otpRef.update({ attempts: newAttempts });
      const remaining = MAX_ATTEMPTS - newAttempts;
      return {
        success: false,
        remainingAttempts: remaining,
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
      };
    }
  }

  // Code verified: delete OTP immediately
  await otpRef.delete();

  // Mark user as verified in Firestore
  const usersRef = db.collection("users");
  let userSnapshot = await usersRef.where("email", "==", normalizedEmail).get();
  if (userSnapshot.empty) {
    userSnapshot = await db.collection("user").where("email", "==", normalizedEmail).get();
  }

  if (!userSnapshot.empty) {
    for (const doc of userSnapshot.docs) {
      await doc.ref.update({
        emailVerified: true,
        updatedAt: new Date(),
      });
    }
  }

  return {
    success: true,
    message: "Email verified successfully.",
  };
}
