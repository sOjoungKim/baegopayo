import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');

    let query = `
      SELECT r.*, c.name as category_name, c.icon as category_icon
      FROM restaurants r
      LEFT JOIN categories c ON r.category_id = c.id
    `;
    const params = [];

    if (categoryId) {
      query += ' WHERE r.category_id = $1';
      params.push(categoryId);
    }

    query += ' ORDER BY r.rating DESC';

    const result = await pool.query(query, params);
    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}