import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'treatments.json');

async function readTreatments() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeTreatments(treatments: any[]) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(treatments, null, 2));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const treatments = await readTreatments();
    const updates = await request.json();
    const id = parseInt(params.id);

    // Преобразуем Date объекты в строки для хранения
    const processedUpdates = { ...updates };
    if (updates.actualDate && updates.actualDate instanceof Date) {
      processedUpdates.actualDate = updates.actualDate.toISOString();
    }
    if (updates.dueDate && updates.dueDate instanceof Date) {
      processedUpdates.dueDate = updates.dueDate.toISOString();
    }

    const updatedTreatments = treatments.map((treatment: any) =>
      treatment.id === id ? { ...treatment, ...processedUpdates } : treatment
    );

    await writeTreatments(updatedTreatments);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating treatment:', error);
    return NextResponse.json(
      { error: 'Failed to update treatment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const treatments = await readTreatments();
    const id = parseInt(params.id);

    const updatedTreatments = treatments.filter(
      (treatment: any) => treatment.id !== id
    );

    await writeTreatments(updatedTreatments);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting treatment:', error);
    return NextResponse.json(
      { error: 'Failed to delete treatment' },
      { status: 500 }
    );
  }
}