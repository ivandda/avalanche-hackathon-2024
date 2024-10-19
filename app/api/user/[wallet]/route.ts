import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import {Government, Student, University} from "@/models";

export async function GET(request: NextRequest, { params }: { params: { wallet: string } }) {
  await dbConnect();
  const { wallet } = params;
  const governmentEntity = await Government.findOne({ walletAddress: wallet });
  if(governmentEntity) return NextResponse.json({userType: 'government', user: governmentEntity});

  const universities = await University.findOne({ walletAddress: wallet });
  if(universities) return NextResponse.json({userType: 'university', user: universities});

  const student = await Student.findOne({ walletAddress: wallet });
  if(student) return NextResponse.json({userType: 'student', user: student});
  
  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const data = await request.json();
  const student = new Student(data);
  await student.save();
  return NextResponse.json(student, { status: 201 });
}