import { connect } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { parseSafeJson } from "@/lib/body-guard";

export const dynamic = "force-dynamic";

const VALID_DEPARTMENTS = [
  "App Dev",
  "Blockchain",
  "Cloud & DevOps",
  "Competitive Programming",
  "Data Science",
  "Design",
  "Game Dev",
  "Management",
  "Outreach",
  "Publicity",
  "UI/UX",
  "Web Dev",
];

const submitSchema = z.object({
  Name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  RegistrationNumber: z
    .string()
    .trim()
    .regex(
      /^\d{2}[A-Za-z]{3}\d{4}$/,
      "Registration number must be 2 numbers, 3 letters, and 4 numbers (e.g. 25BCE5612)"
    ),
  Phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  Gender: z.string().max(50).optional().default(""),
  "Year of Study": z.string().max(50).optional().default(""),
  "Why do you want to join Organization Name?": z.string().max(3000).optional().default(""),
  Department: z
    .string()
    .min(1, "Department is required")
    .refine(
      (dept) => VALID_DEPARTMENTS.some((valid) => valid.toLowerCase() === dept.trim().toLowerCase()),
      "Invalid department selected"
    ),
  Questions: z.record(z.string().max(500), z.any()).optional().default({}),
});

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const ipLimit = rateLimit(`submit_form_ip_${ip}`, { limit: 15, windowMs: 10 * 60 * 1000 });
    if (!ipLimit.success) {
      return new Response(
        JSON.stringify({ message: "Too many submission attempts. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!session.user.emailVerified) {
      return new Response(
        JSON.stringify({ message: "Email verification required. Please verify your account before submitting an application." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = session.user;
    const userEmail = user.email.toLowerCase().trim();

    const userLimit = rateLimit(`submit_form_user_${userEmail}`, { limit: 10, windowMs: 10 * 60 * 1000 });
    if (!userLimit.success) {
      return new Response(
        JSON.stringify({ message: "Too many submission attempts for this account. Please wait." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const deadlineStr = process.env.RECRUITMENT_DEADLINE || "2026-12-31T23:59:59+05:30";
    const deadline = new Date(deadlineStr);
    if (new Date() > deadline) {
      return new Response(
        JSON.stringify({
          message: "The submission deadline has passed",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    let rawData;
    try {
      rawData = await parseSafeJson(req, 100 * 1024);
    } catch (sizeErr) {
      return new Response(
        JSON.stringify({ message: sizeErr.message || "Invalid request payload" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const parseResult = submitSchema.safeParse(rawData);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0]?.message || "Validation failed";
      return new Response(
        JSON.stringify({ message: firstIssue }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const validated = parseResult.data;
    const normalizedDept =
      VALID_DEPARTMENTS.find((v) => v.toLowerCase() === validated.Department.trim().toLowerCase()) ||
      validated.Department;

    const db = await connect();
    const trackerRef = db.collection("candidate_submissions").doc(userEmail);

    await db.runTransaction(async (transaction) => {
      const trackerDoc = await transaction.get(trackerRef);
      let submittedDepts = [];

      if (trackerDoc.exists) {
        submittedDepts = trackerDoc.data()?.departments || [];
      } else {
        const existingDocs = await db.collection("formData").where("Email", "==", userEmail).get();
        submittedDepts = existingDocs.docs.map((doc) => doc.data()?.Department).filter(Boolean);
      }

      if (submittedDepts.some((d) => d.toLowerCase() === normalizedDept.toLowerCase())) {
        const err = new Error(`You have already submitted an application for ${normalizedDept}`);
        err.statusCode = 400;
        throw err;
      }

      if (submittedDepts.length >= 2) {
        const err = new Error("Remember that you can only submit upto 2 unique applications");
        err.statusCode = 400;
        throw err;
      }

      const cleanQuestions = {};
      for (const [qKey, qVal] of Object.entries(validated.Questions || {})) {
        const sanitizedKey = String(qKey).slice(0, 500);
        cleanQuestions[sanitizedKey] =
          qVal !== undefined && qVal !== null ? String(qVal).slice(0, 5000) : "";
      }

      const newDocRef = db.collection("formData").doc();
      transaction.set(newDocRef, {
        Name: validated.Name,
        RegistrationNumber: validated.RegistrationNumber.toUpperCase(),
        Email: userEmail,
        Phone: validated.Phone,
        Gender: validated.Gender || "",
        "Year of Study": validated["Year of Study"] || "",
        "Why do you want to join Organization Name?":
          validated["Why do you want to join Organization Name?"] || "",
        Department: normalizedDept,
        Questions: cleanQuestions,
        status: "waitlisted",
        shortlisted: false,
        createdAt: new Date(),
      });

      transaction.set(
        trackerRef,
        {
          departments: [...submittedDepts, normalizedDept],
          updatedAt: new Date(),
        },
        { merge: true }
      );
    });

    return new Response(
      JSON.stringify({
        message: "Form submitted successfully!",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    if (error.statusCode) {
      return new Response(JSON.stringify({ message: error.message }), {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Form submission error:", error);
    return new Response(JSON.stringify({ message: "Error submitting form" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
