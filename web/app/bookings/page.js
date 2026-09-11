'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { getUser, isAuthed } from '@/lib/auth';
import { authFetch } from '@/lib/api';

const formatVND = (value) => Number(value ?? 0).toLocaleString('vi-VN');

const STATUS_LABEL = {
  PENDING: 'Cho duyet',
  APPROVED: 'Da duyet',
  CANCELLED: 'Da huy',
};

const STATUS_ICON = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  CANCELLED: XCircle,
};

const formatStatus = (status) => {
  const key = String(status ?? '').toUpperCase();
  return STATUS_LABEL[key] ?? status ?? 'N/A';
};

const statusClassName = (status) => {
  const key = String(status ?? '').toLowerCase();
  return `status-badge status-${key}`;
};

const StatusIcon = ({ status }) => {
  const key = String(status ?? '').toUpperCase();
  const Icon = STATUS_ICON[key] ?? CalendarCheck;
  return <Icon size={12} strokeWidth={2.4} />;
};

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const res = await authFetch('/api/bookings/my');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message ?? 'Loi khi tai danh sach dat phong');
        setBookings([]);
        return;
      }
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Khong the ket noi toi server');
      setBookings([]);
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthed()) { router.replace('/login'); return; }
    const u = getUser();
    if (u?.role === 'ADMIN') { router.replace('/admin'); return; }
    load(false);
  }, [load, router]);

  const isEmpty = !loading && bookings.length === 0 && !error;
  const showList = !loading && bookings.length > 0;

  if (!isAuthed()) return <div className="loading-text"><Loader2 size={18} className="spin" />Dang chuyen...</div>;

  return (
    <div>
      <div className="page-header-row">
        <h1 className="page-title">Phieu dat phong cua toi</h1>
        <button type="button" className="button-primary button-refresh" onClick={() => load(true)} disabled={refreshing}>
          {refreshing ? <><Loader2 size={16} className="spin" />Dang tai...</> : <><RefreshCw size={16} strokeWidth={2.2} />Tai lai</>}
        </button>
      </div>
      <p className="page-subtitle">Danh sach phong ban da dat va trang thai duyet tu quan tri vien.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div className="table-wrapper"><div className="table-loading"><Loader2 size={20} className="spin" />Dang tai...</div></div>}
      {isEmpty && <div className="empty-state"><span className="empty-state-icon"><Inbox size={26} strokeWidth={1.8} /></span><p className="empty-state-title">Ban chua dat phong nao</p><p>Hay quay lai trang chu de tim va dat phong.</p></div>}

      {showList && (
        <div className="table-wrapper">
          <table className="bookings-table">
            <thead><tr><th>Ma phieu</th><th>Phong</th><th>Ngay nhan - Ngay tra</th><th>Tong tien</th><th>Trang thai</th></tr></thead>
            <tbody>
              {bookings.map((b) => {
                const roomId = b.room?.id_room ?? 'N/A';
                return (
                  <tr key={b.id}>
                    <td className="col-id">#{b.id}</td>
                    <td className="col-room">#{roomId}</td>
                    <td className="col-dates">{b.startDate ?? '-'} - {b.endDate ?? '-'}</td>
                    <td className="col-total">{formatVND(b.total)}<small>VND</small></td>
                    <td><span className={statusClassName(b.trangthai)}><StatusIcon status={b.trangthai} />{formatStatus(b.trangthai)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showList && (
        <div className="bookings-mobile">
          {bookings.map((b) => {
            const roomId = b.room?.id_room ?? 'N/A';
            return (
              <div className="booking-card" key={`m-${b.id}`}>
                <div className="booking-header"><span className="room-badge">Phieu #{b.id}</span><span className={statusClassName(b.trangthai)}><StatusIcon status={b.trangthai} />{formatStatus(b.trangthai)}</span></div>
                <div className="booking-body">
                  <div className="booking-row"><span className="label">Phong</span><span className="value">#{roomId}</span></div>
                  <div className="booking-row"><span className="label">Nhan - Tra</span><span className="value">{b.startDate ?? '-'} - {b.endDate ?? '-'}</span></div>
                  <hr className="booking-divider" />
                  <div className="booking-row booking-total"><span className="label">Tong</span><span className="value">{formatVND(b.total)}<small>VND</small></span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
