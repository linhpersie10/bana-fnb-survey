import React, { useState, useEffect, useMemo } from 'react';
import {
  KeyRound,
  Lock,
  MapPin,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Unlock,
  UserCheck,
  Users,
} from 'lucide-react';
import { SURVEY_LOCATIONS } from '../data/surveySchema';
import {
  InterviewerProfile,
  UserRole,
  subscribeToAllUsers,
  updateUserRoleAndSettings,
  resetUserPinByAdmin,
  preAssignRoleByEmail,
} from '../services/surveyStorage';

interface UserManagementProps {
  currentUserProfile: InterviewerProfile;
}

const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  interviewer: 'Đáp viên',
};

export const UserManagement: React.FC<UserManagementProps> = ({ currentUserProfile }) => {
  const [users, setUsers] = useState<InterviewerProfile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [busyUid, setBusyUid] = useState<string | null>(null);

  // Quick Pre-Assign Email form
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('interviewer');
  const [newLocationId, setNewLocationId] = useState<number>(1);
  const [addingEmail, setAddingEmail] = useState(false);

  const isSuperadmin =
    currentUserProfile.role === 'superadmin' || Boolean(currentUserProfile.isSuperadmin);

  useEffect(() => {
    const unsub = subscribeToAllUsers((list) => {
      setUsers(list);
    });
    return () => unsub();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          u.displayName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.interviewerCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, roleFilter, search]);

  const counts = useMemo(() => {
    return {
      all: users.length,
      superadmin: users.filter((u) => u.role === 'superadmin').length,
      admin: users.filter((u) => u.role === 'admin').length,
      interviewer: users.filter((u) => u.role === 'interviewer').length,
    };
  }, [users]);

  const handleRoleChange = async (target: InterviewerProfile, nextRole: UserRole) => {
    if (!isSuperadmin && (target.role === 'superadmin' || nextRole === 'superadmin')) return;
    setBusyUid(target.uid);
    try {
      await updateUserRoleAndSettings(target.uid, { role: nextRole });
    } finally {
      setBusyUid(null);
    }
  };

  const handleLocationChange = async (target: InterviewerProfile, nextLocationId: number) => {
    setBusyUid(target.uid);
    try {
      await updateUserRoleAndSettings(target.uid, { defaultLocationId: nextLocationId });
    } finally {
      setBusyUid(null);
    }
  };

  const handleToggleLock = async (target: InterviewerProfile) => {
    if (target.isSuperadmin) return;
    setBusyUid(target.uid);
    try {
      const nextStatus = target.status === 'locked' ? 'approved' : 'locked';
      await updateUserRoleAndSettings(target.uid, { status: nextStatus });
    } finally {
      setBusyUid(null);
    }
  };

  const handleResetPin = async (target: InterviewerProfile) => {
    if (!window.confirm(`Đặt lại mã PIN 6 số cho ${target.displayName} (${target.email})?`)) return;
    setBusyUid(target.uid);
    try {
      await resetUserPinByAdmin(target.uid);
    } finally {
      setBusyUid(null);
    }
  };

  const handlePreAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setAddingEmail(true);
    try {
      await preAssignRoleByEmail(newEmail, newRole, newLocationId);
      setNewEmail('');
    } finally {
      setAddingEmail(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* KPI Role Filter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { key: 'all' as const, label: 'Tất cả tài khoản', count: counts.all, icon: Users },
          {
            key: 'superadmin' as const,
            label: 'Superadmin',
            count: counts.superadmin,
            icon: ShieldCheck,
          },
          { key: 'admin' as const, label: 'Admin', count: counts.admin, icon: Shield },
          {
            key: 'interviewer' as const,
            label: 'Đáp viên (PVV)',
            count: counts.interviewer,
            icon: UserCheck,
          },
        ].map((item) => {
          const Icon = item.icon;
          const active = roleFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setRoleFilter(item.key)}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                active
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className={`text-xs font-medium ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                  {item.label}
                </div>
                <div className="text-xl font-bold mt-0.5">{item.count}</div>
              </div>
              <Icon className={`w-5 h-5 ${active ? 'text-red-400' : 'text-slate-400'}`} />
            </button>
          );
        })}
      </div>

      {/* Quick Pre-Assign Email Form */}
      <form
        onSubmit={handlePreAssign}
        className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
      >
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Nhập email Google để cấp quyền trước (VD: pvv01@gmail.com)..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-red-500"
        />
        <select
          value={newRole}
          onChange={(e) => setNewRole(e.target.value as UserRole)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700"
        >
          <option value="interviewer">Đáp viên (PVV)</option>
          <option value="admin">Admin</option>
          {isSuperadmin && <option value="superadmin">Superadmin</option>}
        </select>
        <select
          value={newLocationId}
          onChange={(e) => setNewLocationId(Number(e.target.value))}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700"
        >
          {SURVEY_LOCATIONS.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={addingEmail || !newEmail.trim()}
          className="px-4 py-2 rounded-xl bg-[#d12f2f] hover:bg-[#b82626] disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Cấp quyền
        </button>
      </form>

      {/* Search & User Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 px-4">Tài khoản</th>
                <th className="py-2.5 px-4">Nhóm quyền</th>
                <th className="py-2.5 px-4">Điểm trực mặc định</th>
                <th className="py-2.5 px-4">Mã PIN</th>
                <th className="py-2.5 px-4">Trạng thái</th>
                <th className="py-2.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isRowBusy = busyUid === u.uid;
                const canEditRole = isSuperadmin || u.role !== 'superadmin';
                return (
                  <tr key={u.uid} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {u.displayName}
                        {u.isSuperadmin && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-50 text-red-700 border border-red-200">
                            ROOT
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        disabled={!canEditRole || isRowBusy || u.isSuperadmin}
                        onChange={(e) => void handleRoleChange(u, e.target.value as UserRole)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 disabled:opacity-60"
                      >
                        <option value="superadmin" disabled={!isSuperadmin}>
                          {ROLE_LABELS.superadmin}
                        </option>
                        <option value="admin">{ROLE_LABELS.admin}</option>
                        <option value="interviewer">{ROLE_LABELS.interviewer}</option>
                      </select>
                    </td>

                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <select
                          value={u.defaultLocationId}
                          disabled={isRowBusy}
                          onChange={(e) => void handleLocationChange(u, Number(e.target.value))}
                          className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                        >
                          {SURVEY_LOCATIONS.map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {u.hasPin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                          Đã đặt PIN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                          Chưa tạo
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {u.status === 'locked' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                          Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                          Hoạt động
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isRowBusy}
                          onClick={() => void handleResetPin(u)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1 transition cursor-pointer"
                          title="Đặt lại mã PIN"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Reset PIN
                        </button>
                        {!u.isSuperadmin && (
                          <button
                            type="button"
                            disabled={isRowBusy}
                            onClick={() => void handleToggleLock(u)}
                            className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                              u.status === 'locked'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                            title={u.status === 'locked' ? 'Mở khóa tài khoản' : 'Tạm khóa tài khoản'}
                          >
                            {u.status === 'locked' ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
