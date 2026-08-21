'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BedDouble,
  CalendarRange,
  ArrowRight,
  Search,
  Inbox,
  Loader2,
  UserCircle2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { isAuthed, getUser } from '@/lib/auth';
import { authFetch } from '@/lib/api';

const formatVND = (value) =>
  Number(value ?? 0).toLocaleString('vi-VN');

const formatRoomStatus = (status) =>
  status === 'AVAILABLE' ? 'Còn trống' : 'Đã đặt';

const ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551776235-dde6d4829808?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1576675784201-0e142fb423d0?auto=format&fit=crop&w=900&q=80',
];

const pickRoomImage = (id) => {
  const key = Number(id) || 0;
  return ROOM_IMAGES[key % ROOM_IMAGES.length];
};

function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">
        <Inbox size={26} strokeWidth={1.8} />
      </span>
      <p className="empty-state-title">{title}</p>
      <p>{message}</p>
    </div>
  );
}

function RoomCard({ room, startDate, endDate, onBook, isBooking }) {
  const imgSrc = room.imageUrl || pickRoomImage(room.id_room);
  return (
    <div className="room-card">
      <div className="room-image">
        <img src={imgSrc} alt={`Phòng #${room.id_room}`} loading="lazy" />
        <div className="room-image-overlay">
          <span className="room-badge">Phòng #{room.id_room}</span>
        </div>
      </div>
      <div className="room-body">
        <div className="room-title">
          {room.sogiuong} giường · {formatRoomStatus(room.trangthai)}
        </div>
        <div className="room-meta">
          <span className="room-meta-item">
            <BedDouble size={15} strokeWidth={2} />
            {room.sogiuong} giường
          </span>
          <span className="room-meta-item">
            <CalendarRange size={15} strokeWidth={2} />
            {startDate} <ArrowRight size={12} strokeWidth={2.4} /> {endDate}
          </span>
        </div>
        <div className="room-price">
          {formatVND(room.pricePerNight)}
          <small>VND / đêm</small>
        </div>
      </div>
      <div className="room-actions">
        <button
          className="button-primary button-block"
          onClick={() => onBook(room.id_room)}
          disabled={isBooking}
        >
          {isBooking ? (
            <>
              <Loader2 size={16} className="spin" />
              Đang đặt...
            </>
          ) : (
            <>Đặt phòng</>
          )}
        </button>
      </div>
    </div>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => onClose(toast.id), 3200);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const Icon = toast.type === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <div
      className={`toast toast-${toast.type}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
    >
      <Icon size={18} strokeWidth={2.2} />
      <span>{toast.message}</span>
    </div>
  );
}

function ToastContainer({ toasts, onClose }) {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={onClose} />
      ))}
    </div>
  );
}

export default function Home() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rooms, setRooms] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [dateError, setDateError] = useState('');
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const sync = () => setUser(isAuthed() ? getUser() : null);
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("authchange", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("authchange", sync);
    };
  }, []);

  const userId = user?.userId ?? null;

  const pushToast = useCallback((message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchAvailableRooms = useCallback(async (start, end) => {
    const res = await fetch(
      `/api/rooms/available?startDate=${start}&endDate=${end}`
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg =
        data?.message ||
        `Không tải được danh sách phòng (HTTP ${res.status})`;
      throw new Error(msg);
    }
    return data;
  }, []);

  const validateDates = useCallback((start, end) => {
    if (!start || !end) {
      return 'Vui lòng chọn ngày nhận và ngày trả';
    }
    if (new Date(end) <= new Date(start)) {
      return 'Ngày trả phòng phải sau ngày nhận phòng';
    }
    return '';
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const validation = validateDates(startDate, endDate);
    setDateError(validation);
    if (validation) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await fetchAvailableRooms(startDate, endDate);
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (roomId) => {
    setError('');
    setMessage('');
    if (!userId) {
      pushToast('Vui lòng đăng nhập để đặt phòng', 'error');
      return;
    }
    setBookingId(roomId);
    try {
      const res = await authFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          userId: Number(userId),
          roomId,
          startDate,
          endDate,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data?.message || `Đặt phòng thất bại (HTTP ${res.status})`;
        setError(msg);
        pushToast(msg, 'error');
        return;
      }
      const okMsg = 'Đặt phòng thành công!';
      setMessage(okMsg);
      pushToast(okMsg, 'success');
      try {
        const refreshed = await fetchAvailableRooms(startDate, endDate);
        setRooms(Array.isArray(refreshed) ? refreshed : []);
      } catch (reloadErr) {
        setError(reloadErr.message);
      }
    } catch (err) {
      const msg = 'Không thể kết nối tới server';
      setError(msg);
      pushToast(msg, 'error');
    } finally {
      setBookingId(null);
    }
  };

  const handleStartChange = (value) => {
    setStartDate(value);
    if (dateError) {
      setDateError(validateDates(value, endDate));
    }
  };

  const handleEndChange = (value) => {
    setEndDate(value);
    if (dateError) {
      setDateError(validateDates(startDate, value));
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const startInvalid = dateError && !!startDate && !!endDate;
  const endInvalid = dateError && !!startDate && !!endDate;

  const showEmpty = searched && !loading && rooms.length === 0 && !error;
  const showList = !loading && rooms.length > 0;

  return (
    <div>
      <h1 className="page-title">Đặt phòng khách sạn</h1>
      <p className="page-subtitle">
        Chọn ngày nhận và ngày trả phòng để xem các phòng còn trống.
      </p>

      {!user && (
        <div className="alert alert-info">
          <AlertCircle size={16} strokeWidth={2.2} />
          Bạn cần{' '}
          <Link href="/login" className="auth-link">
            đăng nhập
          </Link>{' '}
          hoặc{' '}
          <Link href="/register" className="auth-link">
            đăng ký
          </Link>{' '}
          trước khi đặt phòng.
        </div>
      )}

      <div className="search-card">
        <form className="search-form" onSubmit={handleSearch} noValidate>
          <label>
            Khách đặt
            <div className="select-wrap">
              <UserCircle2
                size={16}
                strokeWidth={2}
                className="select-icon"
                aria-hidden="true"
              />
              {user ? (
                <select value={String(user.userId)} disabled>
                  <option value={String(user.userId)}>
                    #{user.userId} · {user.name}
                  </option>
                </select>
              ) : (
                <select disabled>
                  <option>Chưa đăng nhập</option>
                </select>
              )}
            </div>
          </label>
          <label>
            Ngày nhận
            <input
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => handleStartChange(e.target.value)}
              className={startInvalid ? 'invalid' : ''}
              required
            />
          </label>
          <label>
            Ngày trả
            <input
              type="date"
              value={endDate}
              min={startDate || today}
              onChange={(e) => handleEndChange(e.target.value)}
              className={endInvalid ? 'invalid' : ''}
              required
            />
            {dateError && (
              <span className="field-error" role="alert">
                {dateError}
              </span>
            )}
          </label>
          <button type="submit" className="button-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Đang tìm...
              </>
            ) : (
              <>
                <Search size={16} strokeWidth={2.2} />
                Tìm phòng trống
              </>
            )}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && !error && (
        <div className="alert alert-success">{message}</div>
      )}

      {loading && (
        <p className="loading-text">
          <Loader2 size={18} className="spin" />
          Đang tải danh sách phòng...
        </p>
      )}

      {showEmpty && (
        <EmptyState
          title="Không có phòng trống"
          message="Vui lòng thử chọn khoảng ngày khác."
        />
      )}

      {showList && (
        <div className="room-list">
          {rooms.map((room) => (
            <RoomCard
              key={room.id_room}
              room={room}
              startDate={startDate}
              endDate={endDate}
              onBook={handleBook}
              isBooking={bookingId === room.id_room}
            />
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={dismissToast} />
    </div>
  );
}
