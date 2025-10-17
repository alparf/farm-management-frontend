import { NextRequest, NextResponse } from 'next/server';
import { ChemicalTreatment } from '@/types';

let treatments: ChemicalTreatment[] = [];
let nextId = 1;

export async function GET() {
  return NextResponse.json(treatments);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const newTreatment: ChemicalTreatment = {
    ...data,
    id: nextId++,
    createdAt: new Date(),
  };
  treatments.push(newTreatment);
  return NextResponse.json(newTreatment);
}