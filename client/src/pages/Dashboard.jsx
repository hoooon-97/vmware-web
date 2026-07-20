import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [connections, setConnections] = useState([]);
  const [history, setHistory] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConn, setNewConn] = useState({ name: '', host: '', port: 22, username: '' });

  useEffect(() => {
    api.connections.list().then(d => setConnections(d.connections));
    api.execute.history().then(d => setHistory(d.history));
  }, []);

  const addConnection = async (e) => {
    e.preventDefault();
    await api.connections.create(newConn);
    const d = await api.connections.list();
    setConnections(d.connections);
    setShowAddForm(false);
    setNewConn({ name: '', host: '', port: 22, username: '' });
  };

  const deleteConnection = async (id) => {
    await api.connections.delete(id);
    setConnections(connections.filter(c => c.id !== id));
  };

  const trialDays = user?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(user.trial_ends_at) - new Date()) / 86400000))
    : 0;

  return (
    <div className="dashboard">
      <header className="topbar">
        <h1>VMware Core</h1>
        <div className="topbar-right">
          <span className="user-email">{user?.email}</span>
          {user?.license_key ? (
            <span className="badge licensed">라이선스 활성</span>
          ) : (
            <span className="badge trial">체험 {trialDays}일 남음</span>
          )}
          <button onClick={logout} className="btn-logout">로그아웃</button>
        </div>
      </header>

      <div className="content">
        <section className="section">
          <div className="section-header">
            <h2>서버 연결</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-add">+ 추가</button>
          </div>

          {showAddForm && (
            <form onSubmit={addConnection} className="add-form">
              <input placeholder="이름" value={newConn.name} onChange={e => setNewConn({...newConn, name: e.target.value})} required />
              <input placeholder="호스트" value={newConn.host} onChange={e => setNewConn({...newConn, host: e.target.value})} required />
              <input placeholder="포트" type="number" value={newConn.port} onChange={e => setNewConn({...newConn, port: +e.target.value})} />
              <input placeholder="사용자명" value={newConn.username} onChange={e => setNewConn({...newConn, username: e.target.value})} />
              <button type="submit" className="btn-primary">저장</button>
            </form>
          )}

          <div className="connection-list">
            {connections.map(c => (
              <div key={c.id} className="connection-card">
                <div className="conn-info">
                  <strong>{c.name}</strong>
                  <span>{c.host}:{c.port}</span>
                </div>
                <div className="conn-actions">
                  <a href={`/execute/${c.id}`} className="btn-execute">실행</a>
                  <button onClick={() => deleteConnection(c.id)} className="btn-delete">삭제</button>
                </div>
              </div>
            ))}
            {connections.length === 0 && <p className="empty">연결된 서버가 없습니다</p>}
          </div>
        </section>

        <section className="section">
          <h2>실행 이력</h2>
          <div className="history-list">
            {history.slice(0, 20).map(h => (
              <div key={h.id} className={`history-item ${h.status}`}>
                <span className="cmd">{h.command_text?.substring(0, 60)}</span>
                <span className="time">{new Date(h.executed_at).toLocaleString('ko-KR')}</span>
                <span className={`status ${h.status}`}>{h.status === 'success' ? '성공' : '실패'}</span>
              </div>
            ))}
            {history.length === 0 && <p className="empty">실행 이력이 없습니다</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
