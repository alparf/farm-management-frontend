import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'treatments.json');

// Вспомогательная функция для чтения файла
async function readTreatments() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Если файла нет, возвращаем пустой массив
    return [];
  }
}

// Вспомогательная функция для записи файла
async function writeTreatments(treatments: any[]) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(treatments, null, 2));
}

export async function GET() {
  try {
    const treatments = await readTreatments();
    return NextResponse.json(treatments);
  } catch (error) {
    console.error('Error reading treatments:', error);
    return NextResponse.json(
      { error: 'Failed to read treatments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const treatments = await readTreatments();
    const newTreatment = await request.json();
    
    // Добавляем ID и дату создания
    const treatmentWithId = {
      ...newTreatment,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedTreatments = [...treatments, treatmentWithId];
    await writeTreatments(updatedTreatments);
    
    return NextResponse.json(treatmentWithId);
  } catch (error) {
    console.error('Error saving treatment:', error);
    return NextResponse.json(
      { error: 'Failed to save treatment' },
      { status: 500 }
    );
  }
}