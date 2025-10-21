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

export async function GET() {
  try {
    const maintenance = await readMaintenance();
    return NextResponse.json(maintenance);
  } catch (error) {
    console.error('Error reading maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to read maintenance' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const maintenance = await readMaintenance();
    const newRecord = await request.json();
    
    const recordWithId = {
      ...newRecord,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedMaintenance = [...maintenance, recordWithId];
    await writeMaintenance(updatedMaintenance);
    
    return NextResponse.json(recordWithId);
  } catch (error) {
    console.error('Error saving maintenance:', error);
    return NextResponse.json(
      { error: 'Failed to save maintenance' },
      { status: 500 }
    );
  }
}