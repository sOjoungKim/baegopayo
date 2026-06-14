-- 카테고리
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(10)
);

-- 회원
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 식당
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  image_url TEXT,
  min_order INTEGER DEFAULT 0,
  delivery_fee INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0,
  is_open BOOLEAN DEFAULT true
);

-- 메뉴
CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id),
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT,
  description TEXT,
  is_available BOOLEAN DEFAULT true
);

-- 장바구니
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  menu_id INTEGER REFERENCES menus(id),
  restaurant_id INTEGER REFERENCES restaurants(id),
  quantity INTEGER DEFAULT 1
);

-- 주문 헤더
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  restaurant_id INTEGER REFERENCES restaurants(id),
  total_price INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT '접수중',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 주문 상세
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  menu_id INTEGER REFERENCES menus(id),
  quantity INTEGER NOT NULL,
  price_at_order INTEGER NOT NULL
);

-- 샘플 카테고리
INSERT INTO categories (name, icon) VALUES
('치킨', '🍗'),
('피자', '🍕'),
('한식', '🍚'),
('중식', '🥡'),
('분식', '🍜'),
('버거', '🍔')
ON CONFLICT DO NOTHING;

-- 샘플 식당
INSERT INTO restaurants (name, category_id, image_url, min_order, delivery_fee, rating) VALUES
('BBQ 황금올리브', 1, null, 18000, 2000, 4.5),
('도미노피자', 2, null, 15000, 0, 4.3),
('한솥도시락', 3, null, 5000, 1000, 4.1),
('홍콩반점', 4, null, 12000, 2000, 4.4),
('엽기떡볶이', 5, null, 10000, 1500, 4.6),
('맘스터치', 6, null, 8000, 1000, 4.2)
ON CONFLICT DO NOTHING;

-- 샘플 메뉴
INSERT INTO menus (restaurant_id, name, price, description) VALUES
(1, '황금올리브 치킨', 20000, '바삭한 황금올리브 치킨'),
(1, '간장치킨', 20000, '달콤한 간장 소스'),
(1, '반반치킨', 21000, '올리브+간장 반반'),
(2, '슈퍼시드 치즈피자 M', 18900, '고소한 치즈가 듬뿍'),
(2, '불고기 피자 M', 19900, '달콤한 불고기 토핑'),
(3, '제육볶음 도시락', 6500, '매콤달콤 제육볶음'),
(3, '김치찌개 도시락', 6000, '얼큰한 김치찌개'),
(4, '짜장면', 7000, '고소한 춘장 소스'),
(4, '짬뽕', 8000, '얼큰한 해물 짬뽕'),
(4, '탕수육(소)', 15000, '바삭한 탕수육'),
(5, '엽기떡볶이 소', 12000, '매운 엽기떡볶이'),
(5, '치즈떡볶이', 13000, '치즈 추가'),
(6, '싸이버거', 5500, '맘스터치 시그니처'),
(6, '싸이순살버거', 5900, '순살로 즐기는 싸이')
ON CONFLICT DO NOTHING;