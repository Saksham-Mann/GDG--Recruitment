import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`check_apps_${ip}`, { limit: 60, windowMs: 60000 });
    if (!rl.success) {
      return NextResponse.json(
        { message: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    if (!session.user.emailVerified) {
      return NextResponse.json(
        { message: "Email verification required" },
        { status: 403 }
      );
    }

    const user = session.user;
    const userEmail = user.email;

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    if (email.toLowerCase().trim() !== userEmail.toLowerCase().trim()) {
      return NextResponse.json(
        { message: "You can only check your own applications" },
        { status: 403 }
      );
    }

    const db = await connect();
    const snapshot = await db
      .collection("formData")
      .where("Email", "==", userEmail)
      .get();

    const applications = snapshot.docs.map((doc) => {
      const data = doc.data();
      const status = data.status || (data.shortlisted ? "shortlisted" : "waitlisted");
      let createdAtStr = null;
      if (data.createdAt) {
        try {
          createdAtStr = data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString();
        } catch {
          createdAtStr = null;
        }
      }
      return {
        id: doc.id,
        department: data.Department,
        status,
        shortlisted: status === "shortlisted",
        createdAt: createdAtStr,
      };
    });

    const submittedDepartments = applications.map((a) => a.department).filter(Boolean);

    let overallStatus = "none";
    if (applications.length > 0) {
      if (applications.some((a) => a.status === "shortlisted")) {
        overallStatus = "shortlisted";
      } else if (applications.every((a) => a.status === "rejected")) {
        overallStatus = "rejected";
      } else {
        overallStatus = "waitlisted";
      }
    }

    return NextResponse.json(
      {
        count: snapshot.size,
        submittedDepartments,
        applications,
        overallStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking applications:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
