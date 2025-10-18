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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventory = await readInventory();
    const updates = await request.json();
    const id = parseInt(params.id);

    const updatedInventory = inventory.map((product: any) =>
      product.id === id 
        ? { ...product, ...updates, updatedAt: new Date().toISOString() }
        : product
    );

    await writeInventory(updatedInventory);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inventory = await readInventory();
    const id = parseInt(params.id);

    const updatedInventory = inventory.filter(
      (product: any) => product.id !== id
    );

    await writeInventory(updatedInventory);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}