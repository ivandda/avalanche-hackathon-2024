import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import { Student } from "@/models";

// This API simulates a university's student information system for the project.
// It receives a student ID and academic thresholds, queries a mock university database, and returns
// a binary eligibility status (1 for eligible, 0 for ineligible). The endpoint is designed
// to be called by Chainlink Functions within the CheckAcademicStatus smart contract

export async function GET(request: NextRequest) {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const minGrade = Number(searchParams.get('minGrade'));
    const minAssistance = Number(searchParams.get('minAssistance'));

    if (!studentId || isNaN(minGrade) || isNaN(minAssistance)) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    try {
        const student = await Student.findOne({ id: Number(studentId) });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        const passGradeThreshold = student.averageGrade >= minGrade;
        const passAssistanceThreshold = student.assistancePercentage >= minAssistance;

        if (passGradeThreshold && passAssistanceThreshold) {
            return NextResponse.json({ number: 1});
        } else {
            return NextResponse.json({ number: 0 });
        }
    } catch (error) {
        console.error('Error in student-status-api:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}