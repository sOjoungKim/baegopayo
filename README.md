# 배고파요 🐾

> 닥스훈트가 배달해드려요!

배달의 민족 스타일 음식 배달 플랫폼입니다.  
닥스훈트 마스코트와 함께하는 귀여운 배달앱이에요.

🌐 **[배고파요 바로가기](https://baegopayo.vercel.app)**

---

## 🌭 주요 기능

- 🔐 회원가입 / 로그인 / 로그아웃
- 🍽️ 식당 · 메뉴 목록 (카테고리 필터)
- 🛒 장바구니 담기 (한 매장만 가능)
- 📦 주문하기 (배송 주소 · 결제 방식 · 요청사항)
- 📋 주문 내역 보기

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| 데이터베이스 | Neon PostgreSQL |
| 인증 | JWT + bcrypt |
| 배포 | Vercel |

---

## 🗄️ DB 구조

```
users        → 회원 정보
categories   → 음식 카테고리
restaurants  → 식당
menus        → 메뉴
cart_items   → 장바구니
orders       → 주문 헤더
order_items  → 주문 상세
```

---

## 🚀 로컬 실행

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# DATABASE_URL, JWT_SECRET 입력

# DB 초기화
node scripts/init-db.js

# 개발 서버 실행
npm run dev
```

---

## 🐾

*컴퓨터과학개론 기말 프로젝트 — 2026*