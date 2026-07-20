import { useState } from 'react';
import { useAuth } from '../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(email, password);
      else await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>VMware Core</h1>
        <p className="subtitle">VMware 인프라 관리 웹 서비스</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>이메일</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '처리 중...' : isRegister ? '회원가입' : '로그인'}
          </button>
        </form>
        <p className="toggle-auth">
          {isRegister ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
          <button onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? '로그인' : '회원가입'}
          </button>
        </p>
      </div>
    </div>
  );
}
