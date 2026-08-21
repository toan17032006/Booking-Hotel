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
import { isAuthed } from '@/lib/auth';
import { authFetch } from '@/lib/api';

const formatVND = (value) => Number(value ?? 0).toLocaleString('vi-VN');

const STATUS_LABEL = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  CANCELED: 'Đã hủy',
};

const STATUS_ICON = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  CANCELLED: XCircle,
  CANCELED: XCircle,
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
      const res = await authFetch('/api/bookings');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message ?? 'Lỗi khi tải danh sách đặt phòng');
        setBookings([]);
        return;
      }
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Không thể kết nối tới server');
      setBookings([]);
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthed()) {
      router.replace('/login');
      return;
    }
    load(false);
  }, [load, router]);

  const isEmpty = !loading && bookings.length === 0 && !error;
  const showTable = !loading && bookings.length > 0;
  const showCards = !loading && bookings.length > 0;
  const guard = !isAuthed();

  if (guard) {
    return (
      <div className="loading-text">
        <Loader2 size={18} className="spin" />
        Đang chuyển sang trang đăng nhập...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header-row">
        <h1 className="page-title">Danh sách phiếu đặt phòng</h1>
        <button
          type="button"
          className="button-primary button-refresh"
          onClick={() => load(true)}
          disabled={refreshing}
          aria-label="Tải lại danh sách"
        >
          {refreshing ? (
            <>
              <Loader2 size={16} className="spin" />
              Đang tải...
            </>
          ) : (
            <>
              <RefreshCw size={16} strokeWidth={2.2} />
              Tải lại
            </>
          )}
        </button>
      </div>
      <p className="page-subtitle">
        Tất cả các phiếu đặt phòng hiện có trong hệ thống.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      {loading && (
        <div className="table-wrapper">
          <div className="table-loading">
            <Loader2 size={20} className="spin" />
            Đang tải danh sách phiếu đặt...
          </div>
        </div>
      )}

      {isEmpty && (
        <div className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">
            <Inbox size={26} strokeWidth={1.8} />
          </span>
          <p className="empty-state-title">Chưa có phiếu đặt nào</p>
          <p>Hãy quay lại trang chủ để đặt phòng.</p>
        </div>
      )}

      {showTable && (
        <div className="table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Khách</th>
                <th>Phòng</th>
                <th>Ngày nhận → Ngày trả</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const room = b.room ?? {};
                const roomId = room.id_room ?? 'N/A';
                const userName = b.user?.name ?? 'N/A';
                return (
                  <tr key={b.id}>
                    <td className="col-id">#{b.id}</td>
                    <td>{userName}</td>
                    <td className="col-room">#{roomId}</td>
                    <td className="col-dates">
                      {b.startDate ?? '—'}{' '}
                      <span aria-hidden="true">→</span>{' '}
                      {b.endDate ?? '—'}
                    </td>
                    <td className="col-total">
                      {formatVND(b.total)}
                      <small>VND</small>
                    </td>
                    <td>
                      <span className={statusClassName(b.trangthai)}>
                        <StatusIcon status={b.trangthai} />
                        {formatStatus(b.trangthai)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCards && (
        <div className="bookings-mobile">
          {bookings.map((b) => {
            const room = b.room ?? {};
            const roomId = room.id_room ?? 'N/A';
            return (
              <div className="booking-card" key={`m-${b.id}`}>
                <div className="booking-header">
                  <span className="room-badge">Phiếu #{b.id}</span>
                  <span className={statusClassName(b.trangthai)}>
                    <StatusIcon status={b.trangthai} />
                    {formatStatus(b.trangthai)}
                  </span>
                </div>
                <div className="booking-body">
                  <div className="booking-row">
                    <span className="label">Khách</span>
                    <span className="value">{b.user?.name ?? 'N/A'}</span>
                  </div>
                  <div className="booking-row">
                    <span className="label">Phòng</span>
                    <span className="value">#{roomId}</span>
                  </div>
                  <div className="booking-row">
                    <span className="label">Nhận → Trả</span>
                    <span className="value">
                      {b.startDate ?? '—'} → {b.endDate ?? '—'}
                    </span>
                  </div>
                  <hr className="booking-divider" />
                  <div className="booking-row booking-total">
                    <span className="label">Tổng</span>
                    <span className="value">
                      {formatVND(b.total)}
                      <small>VND</small>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
