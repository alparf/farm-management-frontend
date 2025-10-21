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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicles = await readVehicles();
    const updates = await request.json();
    const id = parseInt(params.id);

    const updatedVehicles = vehicles.map((vehicle: any) =>
      vehicle.id === id 
        ? { ...vehicle, ...updates, updatedAt: new Date().toISOString() }
        : vehicle
    );

    await writeVehicles(updatedVehicles);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicles = await readVehicles();
    const id = parseInt(params.id);

    const updatedVehicles = vehicles.filter(
      (vehicle: any) => vehicle.id !== id
    );

    await writeVehicles(updatedVehicles);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}