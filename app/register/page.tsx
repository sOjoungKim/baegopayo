'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
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
          <p style={{ color: '#888', marginTop: 4 }}>회원가입하고 맛있는 거 시켜요!</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              padding: '14px 16px', borderRadius: 12, border: '2px solid var(--beige)',
              fontSize: 15, outline: 'none', width: '100%'
            }}
          />
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
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            style={{
              padding: '14px 16px', borderRadius: 12, border: '2px solid var(--beige)',
              fontSize: 15, outline: 'none', width: '100%'
            }}
          />
          {error && <p style={{ color: 'red', fontSize: 14, fontWeight: 600 }}>{error}</p>}
          <button onClick={handleRegister} disabled={loading} className="btn-primary">
            {loading ? '가입 중...' : '회원가입'}
          </button>
          <button onClick={() => router.push('/login')}
            style={{
              background: 'none', border: 'none', color: 'var(--brown)',
              fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4
            }}>
            이미 계정이 있어요 → 로그인
          </button>
        </div>
      </div>
    </div>
  );
}