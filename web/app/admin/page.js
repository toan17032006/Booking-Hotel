'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  Inbox,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Wrench,
  XCircle,
} from 'lucide-react';
import { getUser, isAuthed } from '@/lib/auth';
import { authJson, authFetch } from '@/lib/api';

const formatVND = (value) => Number(value ?? 0).toLocaleString('vi-VN');

const ROOM_STATUS_LABEL = {
  AVAILABLE: 'Sẵn sàng',
  MAINTENANCE: 'Bảo trì',
};

const ROOM_STATUS_ICON = {
  AVAILABLE: CheckCircle2,
  MAINTENANCE: Wrench,
};

const formatRoomStatus = (status) => {
  const key = String(status ?? '').toUpperCase();
  return ROOM_STATUS_LABEL[key] ?? status ?? 'N/A';
};

const roomStatusClassName = (status) => {
  const key = String(status ?? '').toLowerCase();
  return `status-badge status-${key}`;
};

const RoomStatusIcon = ({ status }) => {
  const key = String(status ?? '').toUpperCase();
  const Icon = ROOM_STATUS_ICON[key] ?? Building2;
  return <Icon size={12} strokeWidth={2.4} />;
};

const BOOKING_STATUS_LABEL = {
  PENDING: 'Chờ xác nhận',
  APPROVED: 'Đã duyệt',
  CANCELLED: 'Đã hủy',
};

const BOOKING_STATUS_ICON = {
  PENDING: Loader2,
  APPROVED: CheckCircle2,
  CANCELLED: XCircle,
};

const formatBookingStatus = (status) => {
  const key = String(status ?? '').toUpperCase();
  return BOOKING_STATUS_LABEL[key] ?? status ?? 'N/A';
};

const bookingStatusClassName = (status) => {
  const key = String(status ?? '').toLowerCase();
  return `status-badge status-${key}`;
};

const BookingStatusIcon = ({ status }) => {
  const key = String(status ?? '').toUpperCase();
  const Icon = BOOKING_STATUS_ICON[key] ?? ClipboardList;
  return <Icon size={12} strokeWidth={2.4} />;
};

const emptyRoom = { sogiuong: 1, pricePerNight: 0, trangthai: 'AVAILABLE' };

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [roomsError, setRoomsError] = useState('');
  const [bookingsError, setBookingsError] = useState('');
  const [globalError, setGlobalError] = useState('');

  const [newRoom, setNewRoom] = useState(emptyRoom);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyRoom);
  const [savingId, setSavingId] = useState(null);
  const [editError, setEditError] = useState('');

  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthed()) {
      router.replace('/login');
      return;
    }
    const u = getUser();
    if (!u || u.role !== 'ADMIN') {
      router.replace('/');
      return;
    }
    setReady(true);
  }, [router]);

  const loadRooms = useCallback(async () => {
    setRoomsError('');
    try {
      const res = await authFetch('/api/rooms');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRoomsError(data?.message ?? 'Không tải được danh sách phòng');
        setRooms([]);
        return;
      }
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      setRoomsError('Không thể kết nối tới server');
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  const loadBookings = useCallback(async () => {
    setBookingsError('');
    try {
      const res = await authFetch('/api/admin/bookings');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBookingsError(data?.message ?? 'Không tải được danh sách phiếu đặt');
        setBookings([]);
        return;
      }
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setBookingsError('Không thể kết nối tới server');
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const loadAll = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else {
        setLoadingRooms(true);
        setLoadingBookings(true);
      }
      await Promise.all([loadRooms(), loadBookings()]);
      setRefreshing(false);
    },
    [loadRooms, loadBookings],
  );

  useEffect(() => {
    if (!ready) return;
    loadAll(false);
  }, [ready, loadAll]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setGlobalError('');
    setNewRoom((r) => ({ ...r }));
    const sogiuong = Number(newRoom.sogiuong);
    const pricePerNight = Number(newRoom.pricePerNight);
    if (!Number.isFinite(sogiuong) || sogiuong <= 0) {
      setCreateError('Số giường phải là số dương');
      return;
    }
    if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
      setCreateError('Giá phòng không hợp lệ');
      return;
    }
    if (!['AVAILABLE', 'MAINTENANCE'].includes(newRoom.trangthai)) {
      setCreateError('Trạng thái không hợp lệ');
      return;
    }
    setCreating(true);
    try {
      const { ok, data } = await authJson('/api/admin/rooms', {
        method: 'POST',
        body: JSON.stringify({ sogiuong, pricePerNight, trangthai: newRoom.trangthai }),
      });
      if (!ok) {
        setCreateError(data?.message ?? 'Không thể tạo phòng');
        return;
      }
      setNewRoom(emptyRoom);
      await loadAll(true);
    } catch (err) {
      setCreateError('Không thể kết nối tới server');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (room) => {
    setEditingId(room.id_room);
    setEditForm({
      sogiuong: room.sogiuong ?? 1,
      pricePerNight: room.pricePerNight ?? 0,
      trangthai: room.trangthai ?? 'AVAILABLE',
    });
    setEditError('');
    setDeleteError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyRoom);
    setEditError('');
  };

  const saveEdit = async (id) => {
    setEditError('');
    const sogiuong = Number(editForm.sogiuong);
    const pricePerNight = Number(editForm.pricePerNight);
    if (!Number.isFinite(sogiuong) || sogiuong <= 0) {
      setEditError('Số giường phải là số dương');
      return;
    }
    if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
      setEditError('Giá phòng không hợp lệ');
      return;
    }
    if (!['AVAILABLE', 'MAINTENANCE'].includes(editForm.trangthai)) {
      setEditError('Trạng thái không hợp lệ');
      return;
    }
    setSavingId(id);
    try {
      const { ok, data } = await authJson(`/api/admin/rooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ sogiuong, pricePerNight, trangthai: editForm.trangthai }),
      });
      if (!ok) {
        setEditError(data?.message ?? 'Không thể lưu phòng');
        return;
      }
      cancelEdit();
      await loadAll(true);
    } catch (err) {
      setEditError('Không thể kết nối tới server');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (room) => {
    setDeleteError('');
    if (typeof window !== 'undefined') {
      const ok = window.confirm(`Xóa phòng #${room.id_room}?`);
      if (!ok) return;
    }
    setDeletingId(room.id_room);
    try {
      const { ok: okRes, data } = await authJson(`/api/admin/rooms/${room.id_room}`, {
        method: 'DELETE',
      });
      if (!okRes) {
        setDeleteError(data?.message ?? 'Phòng đã có phiếu đặt, không xóa được');
        return;
      }
      await loadAll(true);
    } catch (err) {
      setDeleteError('Không thể kết nối tới server');
    } finally {
      setDeletingId(null);
    }
  };

  const updateBookingStatus = async (booking, trangthai) => {
    setGlobalError('');
    setUpdatingId(booking.id);
    try {
      const { ok, data } = await authJson(`/api/admin/bookings/${booking.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ trangthai }),
      });
      if (!ok) {
        setGlobalError(data?.message ?? 'Không thể cập nhật phiếu đặt');
        return;
      }
      await loadAll(true);
    } catch (err) {
      setGlobalError('Không thể kết nối tới server');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!ready) {
    return (
      <div className="loading-text">
        <Loader2 size={18} className="spin" />
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  const showRoomsTable = !loadingRooms && rooms.length > 0;
  const roomsEmpty = !loadingRooms && rooms.length === 0 && !roomsError;
  const showBookingsTable = !loadingBookings && bookings.length > 0;
  const bookingsEmpty = !loadingBookings && bookings.length === 0 && !bookingsError;

  return (
    <div>
      <div className="page-header-row">
        <h1 className="page-title">
          <span className="admin-title-icon" aria-hidden="true">
            <ShieldCheck size={22} strokeWidth={2.2} />
          </span>
          Trang quản trị
        </h1>
        <button
          type="button"
          className="button-primary button-refresh"
          onClick={() => loadAll(true)}
          disabled={refreshing}
          aria-label="Tải lại dữ liệu"
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
        Quản lý phòng và duyệt các phiếu đặt của khách hàng.
      </p>

      {globalError && <div className="alert alert-error">{globalError}</div>}

      <section className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">
            <span className="admin-section-icon" aria-hidden="true">
              <Building2 size={18} strokeWidth={2.2} />
            </span>
            Quản lý phòng
          </h2>
          <span className="admin-section-count">
            {rooms.length} phòng
          </span>
        </div>

        {roomsError && <div className="alert alert-error">{roomsError}</div>}
        {deleteError && <div className="alert alert-error">{deleteError}</div>}

        <form className="admin-form" onSubmit={handleCreate}>
          <label>
            Số giường
            <input
              type="number"
              min={1}
              value={newRoom.sogiuong}
              onChange={(e) => setNewRoom({ ...newRoom, sogiuong: e.target.value })}
              required
            />
          </label>
          <label>
            Giá / đêm (VND)
            <input
              type="number"
              min={0}
              value={newRoom.pricePerNight}
              onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: e.target.value })}
              required
            />
          </label>
          <label>
            Trạng thái
            <div className="select-wrap">
              <select
                value={newRoom.trangthai}
                onChange={(e) => setNewRoom({ ...newRoom, trangthai: e.target.value })}
              >
                <option value="AVAILABLE">Sẵn sàng</option>
                <option value="MAINTENANCE">Bảo trì</option>
              </select>
            </div>
          </label>
          <div className="admin-form-actions">
            <button type="submit" className="button-primary" disabled={creating}>
              {creating ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus size={16} strokeWidth={2.4} />
                  Thêm phòng
                </>
              )}
            </button>
          </div>
          {createError && <div className="field-error admin-form-error">{createError}</div>}
        </form>

        {loadingRooms && (
          <div className="table-wrapper">
            <div className="table-loading">
              <Loader2 size={20} className="spin" />
              Đang tải danh sách phòng...
            </div>
          </div>
        )}

        {roomsEmpty && (
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">
              <Inbox size={26} strokeWidth={1.8} />
            </span>
            <p className="empty-state-title">Chưa có phòng nào</p>
            <p>Hãy thêm phòng mới bằng form phía trên.</p>
          </div>
        )}

        {showRoomsTable && (
          <div className="table-wrapper">
            <table className="bookings-table admin-rooms-table">
              <thead>
                <tr>
                  <th>Mã phòng</th>
                  <th>Giá / đêm</th>
                  <th>Số giường</th>
                  <th>Trạng thái</th>
                  <th className="col-actions">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => {
                  const isEditing = editingId === room.id_room;
                  return (
                    <tr key={room.id_room}>
                      <td className="col-id">#{room.id_room}</td>
                      <td className="col-total">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            className="admin-inline-input"
                            value={editForm.pricePerNight}
                            onChange={(e) =>
                              setEditForm({ ...editForm, pricePerNight: e.target.value })
                            }
                          />
                        ) : (
                          <>
                            {formatVND(room.pricePerNight)}
                            <small>VND</small>
                          </>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            min={1}
                            className="admin-inline-input admin-inline-input-small"
                            value={editForm.sogiuong}
                            onChange={(e) =>
                              setEditForm({ ...editForm, sogiuong: e.target.value })
                            }
                          />
                        ) : (
                          room.sogiuong
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="select-wrap admin-inline-select">
                            <select
                              value={editForm.trangthai}
                              onChange={(e) =>
                                setEditForm({ ...editForm, trangthai: e.target.value })
                              }
                            >
                              <option value="AVAILABLE">Sẵn sàng</option>
                              <option value="MAINTENANCE">Bảo trì</option>
                            </select>
                          </div>
                        ) : (
                          <span className={roomStatusClassName(room.trangthai)}>
                            <RoomStatusIcon status={room.trangthai} />
                            {formatRoomStatus(room.trangthai)}
                          </span>
                        )}
                      </td>
                      <td className="col-actions">
                        {isEditing ? (
                          <div className="admin-inline-actions">
                            <button
                              type="button"
                              className="button-primary button-small"
                              onClick={() => saveEdit(room.id_room)}
                              disabled={savingId === room.id_room}
                            >
                              {savingId === room.id_room ? (
                                <Loader2 size={14} className="spin" />
                              ) : (
                                <CheckCircle2 size={14} strokeWidth={2.4} />
                              )}
                              Lưu
                            </button>
                            <button
                              type="button"
                              className="nav-button nav-button-ghost button-small"
                              onClick={cancelEdit}
                              disabled={savingId === room.id_room}
                            >
                              Hủy
                            </button>
                            {editError && (
                              <span className="field-error admin-inline-error">{editError}</span>
                            )}
                          </div>
                        ) : (
                          <div className="admin-inline-actions">
                            <button
                              type="button"
                              className="nav-button nav-button-ghost button-small"
                              onClick={() => startEdit(room)}
                              disabled={editingId !== null}
                            >
                              <Pencil size={14} strokeWidth={2.2} />
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="nav-button button-danger button-small"
                              onClick={() => handleDelete(room)}
                              disabled={deletingId === room.id_room}
                            >
                              {deletingId === room.id_room ? (
                                <Loader2 size={14} className="spin" />
                              ) : (
                                <Trash2 size={14} strokeWidth={2.2} />
                              )}
                              Xóa
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">
            <span className="admin-section-icon" aria-hidden="true">
              <ClipboardList size={18} strokeWidth={2.2} />
            </span>
            Quản lý phiếu đặt
          </h2>
          <span className="admin-section-count">
            {bookings.length} phiếu
          </span>
        </div>

        {bookingsError && <div className="alert alert-error">{bookingsError}</div>}

        {loadingBookings && (
          <div className="table-wrapper">
            <div className="table-loading">
              <Loader2 size={20} className="spin" />
              Đang tải danh sách phiếu đặt...
            </div>
          </div>
        )}

        {bookingsEmpty && (
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">
              <Inbox size={26} strokeWidth={1.8} />
            </span>
            <p className="empty-state-title">Chưa có phiếu đặt nào</p>
            <p>Hệ thống chưa ghi nhận phiếu đặt phòng nào.</p>
          </div>
        )}

        {showBookingsTable && (
          <div className="table-wrapper">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Khách</th>
                  <th>Phòng</th>
                  <th>Ngày nhận</th>
                  <th>Ngày trả</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th className="col-actions">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const room = b.room ?? {};
                  const roomId = room.id_room ?? 'N/A';
                  const userName = b.user?.name ?? 'N/A';
                  const status = String(b.trangthai ?? '').toUpperCase();
                  const isPending = status === 'PENDING';
                  return (
                    <tr key={b.id}>
                      <td className="col-id">#{b.id}</td>
                      <td>{userName}</td>
                      <td className="col-room">#{roomId}</td>
                      <td className="col-dates">{b.startDate ?? '—'}</td>
                      <td className="col-dates">{b.endDate ?? '—'}</td>
                      <td className="col-total">
                        {formatVND(b.total)}
                        <small>VND</small>
                      </td>
                      <td>
                        <span className={bookingStatusClassName(b.trangthai)}>
                          <BookingStatusIcon status={b.trangthai} />
                          {formatBookingStatus(b.trangthai)}
                        </span>
                      </td>
                      <td className="col-actions">
                        {isPending ? (
                          <div className="admin-inline-actions">
                            <button
                              type="button"
                              className="button-primary button-small"
                              onClick={() => updateBookingStatus(b, 'APPROVED')}
                              disabled={updatingId === b.id}
                            >
                              {updatingId === b.id ? (
                                <Loader2 size={14} className="spin" />
                              ) : (
                                <CheckCircle2 size={14} strokeWidth={2.4} />
                              )}
                              Duyệt
                            </button>
                            <button
                              type="button"
                              className="nav-button button-danger button-small"
                              onClick={() => updateBookingStatus(b, 'CANCELLED')}
                              disabled={updatingId === b.id}
                            >
                              <XCircle size={14} strokeWidth={2.4} />
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <span className="admin-no-action">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
