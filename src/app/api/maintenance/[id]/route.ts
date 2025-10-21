import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'maintenance.json');

async function readMaintenance() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeMaintenance(maintenance: any[]) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(maintenance, null, 2));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const maintenance = await readMaintenance();
    const updates = await request.json();
    const id = parseInt(params.id);

    const updatedMaintenance = maintenance.map((record: any) =>
      record.id === id ? { ...record, ...updates } : record
    );

    await writeMaintenance(updatedMaintenance);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const maintenance = await readMaintenance();
    const id = parseInt(params.id);

    const updatedMaintenance = maintenance.filter(
      (record: any) => record.id !== id
    );

    await writeMaintenance(updatedMaintenance);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to delete maintenance' },
      { status: 500 }
    );
  }
}