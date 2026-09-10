'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/app-store';
import { useUIStore } from '@/store/ui-store';
import type { User, Room } from '@/types';
import { toast } from 'sonner';
import { Modal } from '@/components/shared/Modal';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const { user, setUser, members, currentRoom, setCurrentRoom } = useAppStore();
  const { modalOpen, openModal, closeModal } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState({
    email: '',
    fullName: '',
  });

  const [roomForm, setRoomForm] = useState({
    name: '',
    address: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Mock user data if not logged in
  const mockUser = {
    id: 'user-1',
    email: user?.email || 'minhtuan@gmail.com',
    fullName: user?.full_name || 'Minh Tuấn',
    phone: user?.phone || '0901234567',
    avatar_url: user?.avatar_url || null,
    createdAt: user?.created_at || '2026-09-01T00:00:00Z',
  };

  // Room info
  const roomInfo = {
    name: currentRoom?.name || 'Phòng 302',
    address: currentRoom?.address || '123 Đường ABC, Quận 1, TP.HCM',
  };

  useEffect(() => {
    setEditForm({
      email: mockUser.email,
      fullName: mockUser.fullName,
    });
    setRoomForm({
      name: roomInfo.name,
      address: roomInfo.address,
    });
  }, [mockUser.email, mockUser.fullName, roomInfo.name, roomInfo.address]);

  // Avatar preview from user.avatar_url
  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarPreview(user.avatar_url);
    }
  }, [user?.avatar_url]);

  const handleSaveProfile = () => {
    const updatedUser: User = {
      id: user?.id || 'user-1',
      email: editForm.email,
      full_name: editForm.fullName,
      phone: user?.phone || null,
      avatar_url: user?.avatar_url || null,
      zalo_id: user?.zalo_id || null,
      created_at: user?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(updatedUser);
    closeModal();
    toast.success('Cập nhật hồ sơ thành công!');
  };

  const handleCancelEdit = () => {
    setEditForm({
      email: mockUser.email,
      fullName: mockUser.fullName,
    });
    closeModal();
  };

  const handleSaveRoom = () => {
    const updatedRoom: Room = !currentRoom
      ? {
          id: `room-${(user?.id || '1').slice(0, 8)}`,
          name: roomForm.name,
          address: roomForm.address,
          owner_id: user?.id || 'user-1',
          invite_code: '4B302',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      : {
          ...currentRoom,
          name: roomForm.name,
          address: roomForm.address,
          updated_at: new Date().toISOString(),
        };

    setCurrentRoom(updatedRoom);

    // Save to localStorage and Supabase metadata
    try {
      if (user?.id) {
        localStorage.setItem(`4b_room_${user.id}`, JSON.stringify(updatedRoom));
      }
      localStorage.setItem('4b_last_room', JSON.stringify(updatedRoom));
      const supabase = createClient();
      supabase.auth.updateUser({
        data: {
          room: updatedRoom,
          room_name: updatedRoom.name,
        },
      });
    } catch (e) {
      console.error(e);
    }

    closeModal();
    toast.success('Cập nhật thông tin phòng thành công!');
  };

  const handleCancelRoom = () => {
    setRoomForm({
      name: roomInfo.name,
      address: roomInfo.address,
    });
    closeModal();
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    closeModal();
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('Đổi mật khẩu thành công!');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);

        // Update user with new avatar
        const updatedUser: User = {
          id: user?.id || 'user-1',
          email: user?.email || mockUser.email,
          full_name: user?.full_name || mockUser.fullName,
          phone: user?.phone || null,
          avatar_url: result,
          zalo_id: user?.zalo_id || null,
          created_at: user?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(updatedUser);
        toast.success('Cập nhật ảnh đại diện thành công!');
      };
      reader.readAsDataURL(file);
    }
  };

  const displayAvatar = avatarPreview || user?.avatar_url;

  return (
    <div className="space-y-5">
      <div id="tab-profile">
        {/* Profile Header */}
        <div
          className="rounded-2xl border p-6"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex flex-col items-center text-center md:flex-row md:text-left">
            {/* Avatar */}
            <div className="relative">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {mockUser.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-110"
                style={{ background: 'var(--accent)' }}
                title="Đổi ảnh đại diện"
              >
                <i className="fa-solid fa-camera text-xs" />
              </button>
            </div>

            {/* Info */}
            <div className="mt-4 md:ml-6 md:mt-0">
              <h1
                className="brand-font text-2xl font-bold"
                style={{ color: 'var(--dark)' }}
              >
                {mockUser.fullName}
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                {mockUser.email}
              </p>
              <div
                className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
              >
                <i className="fa-solid fa-user-shield" />
                Trưởng phòng
              </div>
            </div>

            <div className="mt-4 md:ml-auto">
              <button
                onClick={() => openModal('edit-profile')}
                className="rounded-xl border px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--bg-light)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
              >
                <i className="fa-solid fa-pen mr-2" />
                Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Personal Info */}
          <div
            className="rounded-2xl border p-5"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-user text-sm" style={{ color: 'var(--primary)' }} />
                <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                  Thông tin cá nhân
                </span>
              </div>
              <button
                onClick={() => openModal('edit-profile')}
                className="rounded-lg p-1.5 text-xs transition-colors hover:bg-[var(--color-bg-soft-primary)]"
                style={{ color: 'var(--text-muted)' }}
                title="Chỉnh sửa"
              >
                <i className="fa-solid fa-pen-to-square" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Họ và tên
                </label>
                <p className="mt-1 font-medium" style={{ color: 'var(--dark)' }}>
                  {mockUser.fullName}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Email
                </label>
                <p className="mt-1 font-medium" style={{ color: 'var(--dark)' }}>
                  {mockUser.email}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Số điện thoại
                </label>
                <p className="mt-1 font-medium" style={{ color: 'var(--dark)' }}>
                  {mockUser.phone}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Ngày tham gia
                </label>
                <p className="mt-1 font-medium" style={{ color: 'var(--dark)' }}>
                  {new Date(mockUser.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Room Info */}
          <div
            className="rounded-2xl border p-5"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-house text-sm" style={{ color: 'var(--primary)' }} />
                <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                  Thông tin phòng
                </span>
              </div>
              <button
                onClick={() => openModal('edit-room')}
                className="rounded-lg p-1.5 text-xs transition-colors hover:bg-[var(--color-bg-soft-primary)]"
                style={{ color: 'var(--text-muted)' }}
                title="Chỉnh sửa"
              >
                <i className="fa-solid fa-pen-to-square" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Tên phòng
                </label>
                <p className="mt-1 font-medium" style={{ color: 'var(--dark)' }}>
                  {roomInfo.name}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Số thành viên
                </label>
                <p className="mt-1 font-medium" style={{ color: 'var(--dark)' }}>
                  {members.length || 4} người
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Địa chỉ
                </label>
                <p className="mt-1 font-medium" style={{ color: 'var(--dark)' }}>
                  {roomInfo.address}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Vai trò
                </label>
                <div
                  className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
                >
                  <i className="fa-solid fa-crown" />
                  Trưởng phòng
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div
            className="rounded-2xl border p-5"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-sm" style={{ color: 'var(--primary)' }} />
              <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                Bảo mật
              </span>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => openModal('change-password')}
                className="flex w-full items-center justify-between rounded-xl border p-4 transition-colors hover:border-[var(--primary)]"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-light)' }}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-lock" style={{ color: 'var(--primary)' }} />
                  <span className="font-medium" style={{ color: 'var(--dark)' }}>
                    Đổi mật khẩu
                  </span>
                </div>
                <i className="fa-solid fa-chevron-right" style={{ color: 'var(--text-muted)' }} />
              </button>

              <button
                className="flex w-full items-center justify-between rounded-xl border p-4 transition-colors hover:border-[var(--primary)]"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-light)' }}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-key" style={{ color: 'var(--primary)' }} />
                  <span className="font-medium" style={{ color: 'var(--dark)' }}>
                    Xác thực hai yếu tố
                  </span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: 'var(--color-bg-warning-soft)', color: 'var(--accent)' }}
                >
                  Chưa bật
                </span>
              </button>

              <button
                className="flex w-full items-center justify-between rounded-xl border p-4 transition-colors hover:border-[var(--primary)]"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-light)' }}
              >
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-devices" style={{ color: 'var(--primary)' }} />
                  <span className="font-medium" style={{ color: 'var(--dark)' }}>
                    Thiết bị đã đăng nhập
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  1 thiết bị
                </span>
              </button>
            </div>
          </div>

          {/* Connected Accounts */}
          <div
            className="rounded-2xl border p-5"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-4 flex items-center gap-2">
              <i className="fa-solid fa-link text-sm" style={{ color: 'var(--primary)' }} />
              <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                Tài khoản liên kết
              </span>
            </div>

            <div className="space-y-3">
              <button
                className="flex w-full items-center justify-between rounded-xl border p-4 transition-colors hover:border-[var(--primary)]"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-light)' }}
              >
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="font-medium" style={{ color: 'var(--dark)' }}>
                    Facebook
                  </span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
                >
                  Đã liên kết
                </span>
              </button>

              <button
                className="flex w-full items-center justify-between rounded-xl border p-4 transition-colors hover:border-[var(--primary)]"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-light)' }}
              >
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-medium" style={{ color: 'var(--dark)' }}>
                    Google
                  </span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
                >
                  Đã liên kết
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        id="edit-profile"
        title="Chỉnh sửa hồ sơ"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: 'var(--dark)' }}
            >
              Họ và tên
            </label>
            <input
              type="text"
              value={editForm.fullName}
              onChange={(e) =>
                setEditForm({ ...editForm, fullName: e.target.value })
              }
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
              style={{
                background: 'var(--bg-light)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: 'var(--dark)' }}
            >
              Email
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
              style={{
                background: 'var(--bg-light)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: 'var(--dark)' }}
            >
              Số điện thoại
            </label>
            <input
              type="tel"
              value={mockUser.phone}
              readOnly
              className="w-full cursor-not-allowed rounded-xl border px-4 py-3 text-sm opacity-60"
              style={{
                background: 'var(--bg-light)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)',
              }}
            />
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Liên hệ hỗ trợ để thay đổi số điện thoại
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancelEdit}
              className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--bg-light)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
            >
              Hủy
            </button>
            <button
              onClick={handleSaveProfile}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        id="edit-room"
        title="Chỉnh sửa thông tin phòng"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: 'var(--dark)' }}
            >
              Tên phòng
            </label>
            <input
              type="text"
              value={roomForm.name}
              onChange={(e) =>
                setRoomForm({ ...roomForm, name: e.target.value })
              }
              placeholder="VD: Phòng 302"
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
              style={{
                background: 'var(--bg-light)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: 'var(--dark)' }}
            >
              Địa chỉ
            </label>
            <input
              type="text"
              value={roomForm.address}
              onChange={(e) =>
                setRoomForm({ ...roomForm, address: e.target.value })
              }
              placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
              style={{
                background: 'var(--bg-light)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancelRoom}
              className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--bg-light)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
            >
              Hủy
            </button>
            <button
              onClick={handleSaveRoom}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        id="change-password"
        title="Đổi mật khẩu"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: 'var(--dark)' }}
            >
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
              style={{
                background: 'var(--bg-light)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: 'var(--dark)' }}
            >
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              placeholder="Ít nhất 8 ký tự"
              minLength={8}
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
              style={{
                background: 'var(--bg-light)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div>
            <label
              className="mb-1 block text-xs font-semibold"
              style={{ color: 'var(--dark)' }}
            >
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              placeholder="Nhập lại mật khẩu mới"
              className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
              style={{
                background: 'var(--bg-light)',
                borderColor: 'var(--border)',
                color: 'var(--text-main)',
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={closeModal}
              className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--bg-light)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
            >
              Hủy
            </button>
            <button
              onClick={handleChangePassword}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
