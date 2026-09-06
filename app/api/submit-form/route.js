import { connect } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401 }
      );
    }

    const user = session.user;
    const userEmail = user.email;

    const deadlineStr = process.env.RECRUITMENT_DEADLINE || "2026-12-31T23:59:59+05:30";
    const deadline = new Date(deadlineStr);
    if (new Date() > deadline) {
      return new Response(
        JSON.stringify({
          message: "The submission deadline has passed",
        }),
        { status: 403 }
      );
    }

    const db = await connect();
    const data = await req.json();

    const { Department, Questions, ...formFields } = data;

    const rawReg = formFields.RegistrationNumber;
    const normalizedReg = typeof rawReg === "string" ? rawReg.trim().toUpperCase() : "";
    const regNoRegex = /^\d{2}[A-Za-z]{3}\d{4}$/;

    if (normalizedReg && !regNoRegex.test(normalizedReg)) {
      return new Response(
        JSON.stringify({
          message: "Registration number must be 2 numbers, 3 letters, and 4 numbers (e.g. 25BCE5612)",
        }),
        { status: 400 }
      );
    }
    formFields.RegistrationNumber = normalizedReg;

    const collection = db.collection("formData");

    const existingSubmissions = await collection.where("Email", "==", userEmail).get();

    const alreadySubmittedDept = existingSubmissions.docs.some(
      (doc) => (doc.data()?.Department || "").trim().toLowerCase() === (Department || "").trim().toLowerCase()
    );

    if (alreadySubmittedDept) {
      return new Response(
        JSON.stringify({
          message: `You have already submitted an application for ${Department}`,
        }),
        { status: 400 }
      );
    }

    if (existingSubmissions.size >= 2) {
      return new Response(
        JSON.stringify({
          message: "Remember that you can only submit upto 2 unique applications",
        }),
        { status: 400 }
      );
    }

    // Sanitize values to prevent Firestore undefined value errors
    const cleanQuestions = {};
    if (Questions && typeof Questions === "object") {
      for (const [qKey, qVal] of Object.entries(Questions)) {
        cleanQuestions[qKey] = qVal !== undefined && qVal !== null ? String(qVal) : "";
      }
    }

    const cleanFields = {};
    for (const [fKey, fVal] of Object.entries(formFields)) {
      cleanFields[fKey] = fVal !== undefined && fVal !== null ? fVal : "";
    }

    await collection.add({
      ...cleanFields,
      Department,
      Questions: cleanQuestions,
      Email: userEmail,
      createdAt: new Date(),
    });

    return new Response(
      JSON.stringify({
        message: "Form submitted successfully!",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Form submission error:", error);
    return new Response(JSON.stringify({ message: "Error submitting form" }), {
      status: 500,
    });
  }
}
