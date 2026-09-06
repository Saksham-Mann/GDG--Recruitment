import { NextResponse } from 'next/server';
import { connect, serializeFirestoreData } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Forbidden: Administrator access required" },
                { status: 403 }
            );
        }

        const resolvedParams = await params;
        const id = resolvedParams?.id;
        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { success: false, message: "Invalid applicant ID" },
                { status: 400 }
            );
        }

        const body = await req.json();
        const VALID_STATUSES = ["waitlisted", "shortlisted", "rejected"];
        let targetStatus = body.status;

        if (!targetStatus && typeof body.shortlisted === "boolean") {
            targetStatus = body.shortlisted ? "shortlisted" : "waitlisted";
        }

        if (!targetStatus || !VALID_STATUSES.includes(targetStatus)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid payload: 'status' must be one of 'waitlisted', 'shortlisted', or 'rejected'",
                },
                { status: 400 }
            );
        }

        const isShortlisted = targetStatus === "shortlisted";

        const db = await connect();
        const docRef = db.collection('formData').doc(id);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return NextResponse.json({ success: false, message: 'Applicant not found' }, { status: 404 });
        }

        await docRef.update({
            status: targetStatus,
            shortlisted: isShortlisted,
            updatedAt: new Date(),
        });

        const applicant = {
            id: snapshot.id,
            _id: snapshot.id,
            ...serializeFirestoreData(snapshot.data()),
            status: targetStatus,
            shortlisted: isShortlisted,
        };

        return NextResponse.json({ success: true, data: applicant }, { status: 200 });
    } catch (error) {
        console.error('Error updating applicant:', error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
