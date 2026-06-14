import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

// 장바구니 조회
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

    const result = await pool.query(`
      SELECT ci.id, ci.quantity, ci.restaurant_id,
             m.name, m.price, m.image_url,
             r.name as restaurant_name
      FROM cart_items ci
      JOIN menus m ON ci.menu_id = m.id
      JOIN restaurants r ON ci.restaurant_id = r.id
      WHERE ci.user_id = $1
    `, [user.id]);

    return NextResponse.json(result.rows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 장바구니 추가
export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

    const { menuId, restaurantId } = await request.json();

    // 다른 식당 메뉴면 장바구니 비우기
    const existing = await pool.query(
      'SELECT restaurant_id FROM cart_items WHERE user_id = $1 LIMIT 1',
      [user.id]
    );

    if (existing.rows.length > 0 && existing.rows[0].restaurant_id !== restaurantId) {
      await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user.id]);
    }

    // 이미 있으면 수량 증가
    const already = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND menu_id = $2',
      [user.id, menuId]
    );

    if (already.rows.length > 0) {
      await pool.query(
        'UPDATE cart_items SET quantity = quantity + 1 WHERE id = $1',
        [already.rows[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, menu_id, restaurant_id, quantity) VALUES ($1, $2, $3, 1)',
        [user.id, menuId, restaurantId]
      );
    }

    return NextResponse.json({ message: '장바구니에 추가됐어요' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 장바구니 비우기
export async function DELETE() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user.id]);
    return NextResponse.json({ message: '장바구니를 비웠어요' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}