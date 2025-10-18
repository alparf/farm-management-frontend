import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'inventory.json');

async function readInventory() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeInventory(inventory: any[]) {
  await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
  await fs.writeFile(dataFilePath, JSON.stringify(inventory, null, 2));
}

export async function GET() {
  try {
    const inventory = await readInventory();
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error reading inventory:', error);
    return NextResponse.json(
      { error: 'Failed to read inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const inventory = await readInventory();
    const newProduct = await request.json();
    
    const productWithId = {
      ...newProduct,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedInventory = [...inventory, productWithId];
    await writeInventory(updatedInventory);
    
    return NextResponse.json(productWithId);
  } catch (error) {
    console.error('Error saving product:', error);
    return NextResponse.json(
      { error: 'Failed to save product' },
      { status: 500 }
    );
  }
}