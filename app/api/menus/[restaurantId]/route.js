import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { restaurantId } = await params;
    const result = await pool.query(
      'SELECT * FROM menus WHERE restaurant_id = $1 AND is_available = true ORDER BY id',
      [restaurantId]
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}