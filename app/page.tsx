'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [currentView, setCurrentView] = useState<'home' | 'restaurant' | 'cart' | 'orders'>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [orderStep, setOrderStep] = useState<'cart' | 'checkout'>('cart');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('카드');
  const [request, setRequest] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    fetchRestaurants();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user) fetchCartCount();
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchRestaurants = async (categoryId?: number) => {
    const url = categoryId ? `/api/restaurants?category=${categoryId}` : '/api/restaurants';
    const res = await fetch(url);
    const data = await res.json();
    setRestaurants(data);
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/restaurants');
    const data = await res.json();
    const cats = Array.from(new Map(data.map((r: any) => [r.category_id, { id: r.category_id, name: r.category_name, icon: r.category_icon }])).values());
    setCategories(cats);
  };

  const fetchCartCount = async () => {
    const res = await fetch('/api/cart');
    if (res.ok) {
      const data = await res.json();
      setCartCount(data.length);
    }
  };

  const fetchCart = async () => {
    const res = await fetch('/api/cart');
    if (res.ok) {
      const data = await res.json();
      setCartItems(data);
    }
  };

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  };

  const fetchMenus = async (restaurantId: number) => {
    const res = await fetch(`/api/menus/${restaurantId}`);
    const data = await res.json();
    setMenus(data);
  };

  const handleCategoryClick = (categoryId: number) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      fetchRestaurants();
    } else {
      setSelectedCategory(categoryId);
      fetchRestaurants(categoryId);
    }
  };

  const handleRestaurantClick = async (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    await fetchMenus(restaurant.id);
    setCurrentView('restaurant');
  };
  
  const handleAddToCart = async (menu: any) => {
    if (!user) { router.push('/login'); return; }

    // 다른 식당 메뉴가 이미 담겨있는지 확인
    const cartRes = await fetch('/api/cart');
    const cartData = await cartRes.json();
    if (cartData.length > 0 && cartData[0].restaurant_id !== selectedRestaurant.id) {
      showToast('⚠️ 한 매장 메뉴만 담을 수 있어요! 기존 장바구니를 비우고 담을게요.');
    }

    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuId: menu.id, restaurantId: selectedRestaurant.id })
    });
    if (res.ok) {
      showToast(`🐾 ${menu.name} 담았어요!`);
      fetchCartCount();
    }
  };

  const handleOrder = async () => {
    if (!address.trim()) {
      showToast('주소를 입력해주세요!');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, paymentMethod, request })
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      showToast('🎉 주문 완료!');
      setCartCount(0);
      setOrderStep('cart');
      setAddress('');
      setPaymentMethod('카드');
      setRequest('');
      setCurrentView('orders');
      fetchOrders();
    } else {
      showToast(data.error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    setUser(null);
    setCartCount(0);
    setCurrentView('home');
    showToast('로그아웃 됐어요');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* 닥스훈트 캐릭터 */}
      <img src="/dax.gif" alt="배달 닥스훈트" className="dax-walking" />
      {/* 하단 장바구니 팝업 바 */}
      {cartCount > 0 && currentView !== 'cart' && currentView !== 'orders' && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--brown)', color: 'white',
          padding: '16px 24px', zIndex: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>🛒</span>
            <div>
              <p style={{ fontWeight: 800, fontSize: 16 }}>장바구니 {cartCount}개</p>
              <p style={{ fontSize: 13, opacity: 0.85 }}>
                {cartItems.length > 0
                  ? `${cartItems[0]?.name}${cartCount > 1 ? ` 외 ${cartCount - 1}개` : ''}`
                  : '담긴 메뉴가 있어요'}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setCurrentView('cart'); fetchCart(); }}
            style={{
              background: 'var(--yellow)', color: 'var(--text)',
              border: 'none', borderRadius: 12, padding: '12px 24px',
              fontWeight: 800, fontSize: 16, cursor: 'pointer'
            }}>
            장바구니 보기 →
          </button>
        </div>
      )}
      {/* 토스트 */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#1A1A1A', color: 'white', padding: '12px 24px',
          borderRadius: 12, zIndex: 9999, fontWeight: 600, fontSize: 15
        }}>{toast}</div>
      )}

      {/* 헤더 */}
      <header style={{
        background: 'white', borderBottom: '3px solid var(--brown)',
        padding: '0 24px', height: 64, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div
          onClick={() => setCurrentView('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ fontSize: 28 }}>🐾</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--brown)' }}>배고파요</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{user.name}님</span>
              <button onClick={() => { setCurrentView('cart'); fetchCart(); }}
                style={{ background: 'var(--yellow)', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
                🛒 {cartCount > 0 ? cartCount : ''}
              </button>
              <button onClick={() => { setCurrentView('orders'); fetchOrders(); }}
                style={{ background: 'var(--beige)', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
                📋 주문내역
              </button>
              <button onClick={handleLogout}
                style={{ background: 'none', border: '2px solid var(--brown)', borderRadius: 10, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', color: 'var(--brown)', fontSize: 15 }}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/login')}
                style={{ background: 'var(--brown)', color: 'white', border: 'none', borderRadius: 10, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
                로그인
              </button>
              <button onClick={() => router.push('/register')}
                style={{ background: 'var(--yellow)', border: 'none', borderRadius: 10, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
                회원가입
              </button>
            </>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* 홈 화면 */}
        {currentView === 'home' && (
          <>
            {/* 히어로 배너 */}
            <div style={{
              background: 'linear-gradient(135deg, var(--brown), #E8834A)',
              borderRadius: 20, padding: '40px 48px', marginBottom: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <h1 style={{ color: 'white', fontSize: 36, fontWeight: 900, lineHeight: 1.3 }}>
                  배고파요? 🐾<br />
                  <span style={{ fontSize: 22, fontWeight: 600 }}>닥스훈트가 빠르게 배달해드려요!</span>
                </h1>
              </div>
              <div style={{ fontSize: 80 }}>🌭</div>
            </div>

            {/* 카테고리 */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>카테고리</h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {categories.map((cat: any) => (
                  <button key={cat.id} onClick={() => handleCategoryClick(cat.id)}
                    style={{
                      background: selectedCategory === cat.id ? 'var(--brown)' : 'white',
                      color: selectedCategory === cat.id ? 'white' : 'var(--text)',
                      border: '2px solid var(--brown)', borderRadius: 50,
                      padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 15,
                      transition: 'all 0.2s'
                    }}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 식당 목록 */}
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
                {selectedCategory ? '검색 결과' : '전체 식당'} ({restaurants.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {restaurants.map((r: any) => (
                  <div key={r.id} className="card" onClick={() => handleRestaurantClick(r)}
                    style={{ cursor: 'pointer' }}>
                    <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
                      {r.image_url ? (
                        <img src={r.image_url} alt={r.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          height: 160, background: 'linear-gradient(135deg, var(--beige), var(--yellow))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60
                        }}>{r.category_icon}</div>
                      )}
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{r.name}</h3>
                      <div style={{ color: '#666', fontSize: 14, display: 'flex', gap: 12 }}>
                        <span>⭐ {r.rating}</span>
                        <span>최소 {r.min_order.toLocaleString()}원</span>
                        <span>배달비 {r.delivery_fee === 0 ? '무료' : r.delivery_fee.toLocaleString() + '원'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 식당 상세 (메뉴) */}
        {currentView === 'restaurant' && selectedRestaurant && (
          <>
            <button onClick={() => setCurrentView('home')}
              style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', marginBottom: 16, fontWeight: 700, color: 'var(--brown)' }}>
              ← 돌아가기
            </button>
            <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontSize: 26, fontWeight: 900 }}>{selectedRestaurant.name}</h2>
              <div style={{ color: '#666', marginTop: 8, display: 'flex', gap: 16 }}>
                <span>⭐ {selectedRestaurant.rating}</span>
                <span>최소주문 {selectedRestaurant.min_order.toLocaleString()}원</span>
                <span>배달비 {selectedRestaurant.delivery_fee === 0 ? '무료' : selectedRestaurant.delivery_fee.toLocaleString() + '원'}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {menus.map((menu: any) => (
                <div key={menu.id} className="card" style={{ display: 'flex', padding: 16, gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                    {menu.image_url ? (
                      <img src={menu.image_url} alt={menu.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: 80, height: 80, background: 'var(--beige)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36
                      }}>🍽️</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 800, fontSize: 16 }}>{menu.name}</h3>
                    <p style={{ color: '#888', fontSize: 13, margin: '4px 0' }}>{menu.description}</p>
                    <p style={{ fontWeight: 800, color: 'var(--brown)', fontSize: 17 }}>{menu.price.toLocaleString()}원</p>
                  </div>
                  <button onClick={() => handleAddToCart(menu)}
                    style={{ background: 'var(--brown)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 20, flexShrink: 0 }}>
                    +
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

{/* 장바구니 */}
{currentView === 'cart' && (
  <>
    <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>🛒 장바구니</h2>
    {cartItems.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🐾</div>
        <p style={{ fontSize: 18, fontWeight: 600 }}>장바구니가 비어있어요</p>
      </div>
    ) : orderStep === 'cart' ? (
      <>
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
          {cartItems.map((item: any) => (
            <div key={item.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--beige)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{item.name}</p>
                <p style={{ color: '#888', fontSize: 14 }}>{item.restaurant_name}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 800, color: 'var(--brown)' }}>{(item.price * item.quantity).toLocaleString()}원</p>
                <p style={{ color: '#888', fontSize: 14 }}>수량 {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900 }}>
            <span>총 금액</span>
            <span style={{ color: 'var(--brown)' }}>
              {cartItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0).toLocaleString()}원
            </span>
          </div>
        </div>
        <button onClick={() => setOrderStep('checkout')} className="btn-primary">
          🐾 주문하러 가기
        </button>
      </>
    ) : (
      <>
        <button onClick={() => setOrderStep('cart')}
          style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', marginBottom: 16, fontWeight: 700, color: 'var(--brown)' }}>
          ← 장바구니로
        </button>

        {/* 배송 정보 */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>📍 배송 정보</h3>
          <input
            type="text"
            placeholder="배송 주소를 입력해주세요"
            value={address}
            onChange={e => setAddress(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12,
              border: '2px solid var(--beige)', fontSize: 15, outline: 'none'
            }}
          />
        </div>

        {/* 결제 방식 */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>💳 결제 방식</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            {['카드', '카카오페이', '네이버페이', '현금'].map(method => (
              <button key={method} onClick={() => setPaymentMethod(method)}
                style={{
                  padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  border: '2px solid var(--brown)',
                  background: paymentMethod === method ? 'var(--brown)' : 'white',
                  color: paymentMethod === method ? 'white' : 'var(--brown)',
                  transition: 'all 0.2s'
                }}>
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* 요청사항 */}
        <div style={{ background: 'white', borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>📝 요청사항</h3>
          <textarea
            placeholder="요청사항을 입력해주세요 (선택)"
            value={request}
            onChange={e => setRequest(e.target.value)}
            rows={3}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12,
              border: '2px solid var(--beige)', fontSize: 15, outline: 'none',
              resize: 'none', fontFamily: 'inherit'
            }}
          />
        </div>

        {/* 최종 금액 */}
        <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900 }}>
            <span>총 결제 금액</span>
            <span style={{ color: 'var(--brown)' }}>
              {cartItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0).toLocaleString()}원
            </span>
          </div>
          <p style={{ color: '#888', fontSize: 14, marginTop: 8 }}>결제 방식: {paymentMethod}</p>
        </div>

        <button onClick={handleOrder} disabled={loading} className="btn-primary">
          {loading ? '결제 중...' : '🐾 결제하기'}
        </button>
      </>
    )}
  </>
)}

{/* 주문 내역 */}
{currentView === 'orders' && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>📋 주문 내역</h2>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#888' }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🐾</div>
                <p style={{ fontSize: 18, fontWeight: 600 }}>아직 주문 내역이 없어요</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map((order: any) => (
                  <div key={order.id} style={{ background: 'white', borderRadius: 16, padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h3 style={{ fontWeight: 800, fontSize: 18 }}>{order.restaurant_name}</h3>
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {new Date(order.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ color: '#555', fontSize: 14, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--beige)' }}>
                      {order.items.map((item: any, i: number) => (
                        <span key={i}>{item.name} x{item.quantity}{i < order.items.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                    {order.address && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                        <span style={{ fontSize: 14 }}>📍</span>
                        <span style={{ fontSize: 14, color: '#555' }}>{order.address}</span>
                      </div>
                    )}
                    {order.payment_method && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 14 }}>💳</span>
                        <span style={{ fontSize: 14, color: '#555' }}>{order.payment_method}</span>
                      </div>
                    )}
                    {order.request && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12 }}>
                        <span style={{ fontSize: 14 }}>📝</span>
                        <span style={{ fontSize: 14, color: '#555' }}>{order.request}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <span style={{ fontWeight: 900, color: 'var(--brown)', fontSize: 18 }}>
                        {order.total_price.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}