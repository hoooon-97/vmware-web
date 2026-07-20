import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Execute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [connection, setConnection] = useState(null);
  const [password, setPassword] = useState('');
  const [command, setCommand] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.connections.list().then(d => {
      const conn = d.connections.find(c => c.id === parseInt(id));
      setConnection(conn);
    });
    api.commands.list().then(d => setCategories(d.categories));
  }, [id]);

  const execute = async () => {
    if (!command.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.execute.ssh({
        host: connection.host,
        port: connection.port,
        username: connection.username,
        password,
        command,
      });
      setResult(res);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="execute-page">
      <header className="topbar">
        <button onClick={() => navigate('/')} className="btn-back">← 뒤로</button>
        <h1>{connection?.name || '명령 실행'}</h1>
        <span className="host-info">{connection?.host}</span>
      </header>

      <div className="execute-content">
        <div className="sidebar">
          <h3>명령어 카테고리</h3>
          {categories.map((cat, i) => (
            <div key={i} className="category">
              <h4>{cat.category}</h4>
              {cat.commands?.slice(0, 10).map((cmd, j) => (
                <button
                  key={j}
                  className="cmd-btn"
                  onClick={() => setCommand(cmd.command || cmd.name)}
                >
                  {cmd.name}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="main-area">
          <div className="exec-form">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <textarea
              placeholder="명령어를 입력하세요..."
              value={command}
              onChange={e => setCommand(e.target.value)}
              rows={3}
            />
            <button onClick={execute} disabled={loading} className="btn-primary">
              {loading ? '실행 중...' : '실행 (⌘ Enter)'}
            </button>
          </div>

          {result && (
            <div className="result-area">
              {result.error ? (
                <pre className="error">{result.error}</pre>
              ) : (
                <>
                  <div className="result-meta">
                    <span>종료 코드: {result.exitCode}</span>
                    <span>소요 시간: {result.duration}ms</span>
                  </div>
                  <pre className="stdout">{result.stdout}</pre>
                  {result.stderr && <pre className="stderr">{result.stderr}</pre>}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
