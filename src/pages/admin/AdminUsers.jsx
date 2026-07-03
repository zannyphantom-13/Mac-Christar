import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Users, Search, ChevronDown, ChevronUp, Mail, Phone, Calendar, Shield, Loader2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'users'));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const tA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : (a.createdAt?.toMillis?.() || 0);
          const tB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt?.toMillis?.() || 0);
          return tB - tA;
        });
        setUsers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || (u.firstName || '').toLowerCase().includes(q) || (u.lastName || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').includes(q);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={26} color="var(--primary)" /> Registered Users
          </h1>
          <p style={{ color: 'var(--gray-1)', fontSize: '13px', marginTop: '4px' }}>{users.length} registered customer{users.length !== 1 ? 's' : ''}</p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-2)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone…"
            style={{ width: '100%', padding: '10px 12px 10px 34px', background: 'var(--dark-card)', border: '1.5px solid var(--dark-border)', borderRadius: 'var(--radius-sm)', color: 'var(--white)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--dark-border)'} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Loader2 className="spinner" size={48} color="var(--primary)" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--gray-1)' }}>Loading users…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)' }}>
          <Users size={56} color="var(--gray-2)" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--gray-1)', fontWeight: 600 }}>No users found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(u => {
            const isOpen = expanded === u.id;
            const initials = (u.firstName?.[0] || u.email?.[0] || '?').toUpperCase();
            const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Unnamed User';
            const joinedDate = typeof u.createdAt === 'string'
              ? new Date(u.createdAt).toLocaleDateString('en-GB')
              : u.createdAt?.toDate?.()?.toLocaleDateString('en-GB') || '—';

            return (
              <div key={u.id} style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', transition: 'var(--transition)' }}>
                {/* Header */}
                <div
                  onClick={() => setExpanded(isOpen ? null : u.id)}
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', flexWrap: 'wrap' }}
                >
                  {/* Avatar */}
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,94,0,0.15)', border: '2px solid rgba(255,94,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900, color: 'var(--primary)', flexShrink: 0, overflow: 'hidden' }}>
                    {u.avatar ? <img src={u.avatar} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                  </div>

                  {/* Name + Email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName}</span>
                      {u.isAdmin && (
                        <span style={{ background: 'rgba(255,61,0,0.15)', color: 'var(--danger)', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', flexShrink: 0 }}>Admin</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-1)', marginTop: '2px' }}>{u.email}</div>
                  </div>

                  {/* Joined date */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>{joinedDate}</div>
                    <div style={{ fontSize: '10px', color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Joined</div>
                  </div>

                  <div style={{ color: 'var(--gray-1)' }}>{isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
                </div>

                {/* Expanded Details */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--dark-border)', padding: '18px 20px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={11} /> Email</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, wordBreak: 'break-all' }}>{u.email}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={11} /> Phone</div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{u.phone ? `+234 ${u.phone}` : 'Not provided'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={11} /> Role</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: u.isAdmin ? 'var(--danger)' : 'var(--gray-1)' }}>{u.isAdmin ? 'Administrator' : 'Customer'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--gray-2)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} /> Registered</div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{joinedDate}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--dark-border)', textAlign: 'right' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--gray-2)' }}>UID: {u.id}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
