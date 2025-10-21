import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'vehicles.json');

async function readVehicles() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeVehicles(vehicles: any[]) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(vehicles, null, 2));
}

export async function GET() {
  try {
    const vehicles = await readVehicles();
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error reading vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to read vehicles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const vehicles = await readVehicles();
    const newVehicle = await request.json();
    
    const vehicleWithId = {
      ...newVehicle,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedVehicles = [...vehicles, vehicleWithId];
    await writeVehicles(updatedVehicles);
    
    return NextResponse.json(vehicleWithId);
  } catch (error) {
    console.error('Error saving vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to save vehicle' },
      { status: 500 }
    );
  }
}