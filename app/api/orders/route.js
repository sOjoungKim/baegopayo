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

// 주문 내역 조회
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });

    const orders = await pool.query(`
    SELECT o.id, o.total_price, o.status, o.created_at,
           o.address, o.payment_method, o.request,
           r.name as restaurant_name
    FROM orders o
    JOIN restaurants r ON o.restaurant_id = r.id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC
  `, [user.id]);

    const ordersWithItems = await Promise.all(
      orders.rows.map(async (order) => {
        const items = await pool.query(`
          SELECT oi.quantity, oi.price_at_order,
                 m.name
          FROM order_items oi
          JOIN menus m ON oi.menu_id = m.id
          WHERE oi.order_id = $1
        `, [order.id]);
        return { ...order, items: items.rows };
      })
    );

    return NextResponse.json(ordersWithItems);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 주문하기
export async function POST(request) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: '로그인 필요' }, { status: 401 });
    const { address, paymentMethod, request: userRequest } = await request.json();

    // 장바구니 조회
    const cartResult = await pool.query(`
      SELECT ci.quantity, ci.restaurant_id,
             m.id as menu_id, m.price
      FROM cart_items ci
      JOIN menus m ON ci.menu_id = m.id
      WHERE ci.user_id = $1
    `, [user.id]);

    if (cartResult.rows.length === 0) {
      return NextResponse.json({ error: '장바구니가 비어있어요' }, { status: 400 });
    }

    const cartItems = cartResult.rows;
    const restaurantId = cartItems[0].restaurant_id;
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderResult = await pool.query(
        'INSERT INTO orders (user_id, restaurant_id, total_price, status, address, payment_method, request) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [user.id, restaurantId, totalPrice, '접수중', address, paymentMethod, userRequest]
      );
    const orderId = orderResult.rows[0].id;

    // 주문 상세 저장
    await Promise.all(
      cartItems.map(item =>
        pool.query(
          'INSERT INTO order_items (order_id, menu_id, quantity, price_at_order) VALUES ($1, $2, $3, $4)',
          [orderId, item.menu_id, item.quantity, item.price]
        )
      )
    );

    // 장바구니 비우기
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [user.id]);

    return NextResponse.json({ message: '주문이 완료됐어요!', orderId }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}