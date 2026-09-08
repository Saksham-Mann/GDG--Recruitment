import nodemailer from "nodemailer";
import { reviews } from "@/constants";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { sanitizeEmailHtml } from "@/lib/sanitize-html";

export const dynamic = "force-dynamic";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME?.trim(),
        pass: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s+/g, "") : undefined,
    },
});

function sanitizeHeader(val) {
    if (typeof val !== "string") return "";
    return val.replace(/[\r\n\t]/g, " ").trim();
}

export async function POST(req) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden: Administrator privileges required" },
                { status: 403 }
            );
        }

        const { recipients, payloadData } = await req.json();

        if (!Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json(
                { error: "No recipients provided" },
                { status: 400 }
            );
        }

        if (recipients.length > 50) {
            return NextResponse.json(
                { error: "Recipient batch size exceeds maximum limit of 50" },
                { status: 400 }
            );
        }

        if (!payloadData?.subject || !payloadData?.body) {
            return NextResponse.json(
                { error: "Subject and email body are required" },
                { status: 400 }
            );
        }

        const safeSubject = sanitizeHeader(payloadData.subject).slice(0, 150);
        const cleanBody = sanitizeEmailHtml(payloadData.body);

        for (const recipient of recipients) {
            let depart = recipient.Department;
            if (depart === "Video Editing") {
                depart = "Photography";
            }
            const dept = reviews.find((item) => item.name === depart);

            let deptName = dept?.name || recipient.Department || "Department";
            if (
                deptName === "Web Development" ||
                deptName === "App Development"
            ) {
                deptName = "Development Department";
            }

            if (deptName === "Photography" || deptName === "Video Editing") {
                deptName = "Photography & Video Editing Department";
            }

            let generalTemp = `
                <div>
                    ${cleanBody}
                </div>
                `;

            generalTemp = generalTemp.replace(/#name/g, sanitizeHeader(recipient.Name || "Candidate"));
            generalTemp = generalTemp.replace(/#dept/g, sanitizeHeader(deptName));

            const safeTo = sanitizeHeader(recipient.Email);
            if (!safeTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeTo)) {
                continue;
            }

            const mailOptions = {
                from: process.env.EMAIL_USERNAME,
                to: safeTo,
                subject: safeSubject,
                html: generalTemp,
            };

            await transporter.sendMail(mailOptions);
        }

        return NextResponse.json(
            { message: "Emails sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending emails:", error);
        return NextResponse.json(
            { error: "Failed to send emails" },
            { status: 500 }
        );
    }
}

