'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } else {
      setError(data.error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--cream)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: 'white', borderRadius: 20, padding: 40, width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🐾</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--brown)' }}>배고파요</h1>
          <p style={{ color: '#888', marginTop: 4 }}>로그인하고 주문해요!</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              padding: '14px 16px', borderRadius: 12, border: '2px solid var(--beige)',
              fontSize: 15, outline: 'none', width: '100%'
            }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              padding: '14px 16px', borderRadius: 12, border: '2px solid var(--beige)',
              fontSize: 15, outline: 'none', width: '100%'
            }}
          />
          {error && <p style={{ color: 'red', fontSize: 14, fontWeight: 600 }}>{error}</p>}
          <button onClick={handleLogin} disabled={loading} className="btn-primary">
            {loading ? '로그인 중...' : '로그인'}
          </button>
          <button onClick={() => router.push('/register')}
            style={{
              background: 'none', border: 'none', color: 'var(--brown)',
              fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4
            }}>
            아직 계정이 없어요 → 회원가입
          </button>
        </div>
      </div>
    </div>
  );
}