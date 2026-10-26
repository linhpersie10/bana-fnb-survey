import React, { useState, useMemo } from 'react';
import {
  Download,
  RefreshCw,
  Search,
  Cloud,
  CloudOff,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Filter,
  Clock,
  MapPin,
  User,
} from 'lucide-react';
import {
  SurveyResponseData,
  SURVEY_LOCATIONS,
  S4_OPTIONS,
  S5_OPTIONS,
  S6_OPTIONS,
  S7_OPTIONS,
  S9_OPTIONS,
  A1_OPTIONS,
  A2_OPTIONS,
  OptionItem,
  exportResponsesToCsv,
} from '../data/surveySchema';

interface ResponsesTableProps {
  responses: SurveyResponseData[];
  isSyncing: boolean;
  onSyncOffline: () => Promise<void>;
}

export const ResponsesTable: React.FC<ResponsesTableProps> = ({
  responses,
  isSyncing,
  onSyncOffline,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'screenout' | 'unsynced'>('all');
  const [locationFilter, setLocationFilter] = useState<number | 'all'>('all');
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponseData | null>(null);

  const pendingSyncCount = useMemo(
    () => responses.filter((r) => !r.syncedToCloud && !r.id.startsWith('PILOT_SAMPLE_')).length,
    [responses]
  );

  const filteredResponses = useMemo(() => {
    return responses.filter((r) => {
      if (statusFilter === 'completed' && r.status !== 'completed') return false;
      if (statusFilter === 'screenout' && r.status !== 'screenout') return false;
      if (statusFilter === 'unsynced' && r.syncedToCloud) return false;
      if (locationFilter !== 'all' && r.locationId !== locationFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = r.surveyCode.toLowerCase().includes(q);
        const matchPvv = r.interviewerName.toLowerCase().includes(q);
        const matchGift = r.giftName.toLowerCase().includes(q);
        const matchNote = r.C4_note.toLowerCase().includes(q);
        if (!matchCode && !matchPvv && !matchGift && !matchNote) return false;
      }
      return true;
    });
  }, [responses, statusFilter, locationFilter, searchQuery]);

  const handleDownloadCsv = (onlyCompleted: boolean) => {
    const list = onlyCompleted
      ? filteredResponses.filter((r) => r.status === 'completed')
      : filteredResponses;
    if (list.length === 0) {
      alert('Không có bản ghi nào phù hợp để xuất CSV!');
      return;
    }
    exportResponsesToCsv(list);
  };

  const getOptionLabel = (options: OptionItem[], code: number | null) => {
    if (code === null) return '—';
    return options.find((o) => o.code === code)?.label || `Mã ${code}`;
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header & Action Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/90 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold uppercase tracking-wider">
            Project: banafi-kpi / Database: pkt-survey
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Danh sách Phiếu khảo sát & Xuất dữ liệu phân tích
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Định dạng CSV chuẩn UTF-8 BOM tương thích trực tiếp với Excel, SPSS và PowerBI theo Khung phân tích Phụ lục 2.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onSyncOffline}
            disabled={isSyncing}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition cursor-pointer ${
              pendingSyncCount > 0
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing
              ? 'Đang đồng bộ Cloud...'
              : pendingSyncCount > 0
              ? `Đồng bộ ngay (${pendingSyncCount} phiếu chờ)`
              : 'Đồng bộ Cloud'}
          </button>

          <button
            type="button"
            onClick={() => handleDownloadCsv(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Xuất CSV Mẫu Hợp Lệ ({filteredResponses.filter((r) => r.status === 'completed').length})
          </button>

          <button
            type="button"
            onClick={() => handleDownloadCsv(false)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Xuất Tất Cả ({filteredResponses.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mã phiếu, tên PVV, quà tặng, ghi chú..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả trạng thái ({responses.length})</option>
            <option value="completed">
              Hoàn thành hợp lệ ({responses.filter((r) => r.status === 'completed').length})
            </option>
            <option value="screenout">
              Dừng sàng lọc - Screen-out ({responses.filter((r) => r.status === 'screenout').length})
            </option>
            <option value="unsynced">
              Lưu cục bộ / Chưa đẩy Cloud ({responses.filter((r) => !r.syncedToCloud).length})
            </option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={locationFilter}
            onChange={(e) =>
              setLocationFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả 5 điểm khảo sát</option>
            {SURVEY_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 overflow-hidden">
        {filteredResponses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-base font-extrabold text-slate-700">
              Chưa có dữ liệu phiếu khảo sát nào khớp bộ lọc
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Hãy thực hiện phỏng vấn tại tab &ldquo;Phỏng vấn du khách&rdquo; hoặc nạp dữ liệu mẫu Pilot trong tab &ldquo;Bảng Quota&rdquo;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Mã phiếu / Ngày</th>
                  <th className="py-3.5 px-4">Điểm khảo sát & PVV</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Chân dung (S5 / S6 / S7)</th>
                  <th className="py-3.5 px-4">Chi dự kiến (A1) vs Thực tế (A4)</th>
                  <th className="py-3.5 px-4">Đồng bộ</th>
                  <th className="py-3.5 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredResponses.map((r) => {
                  const locName =
                    SURVEY_LOCATIONS.find((l) => l.id === r.locationId)?.name || `Điểm ${r.locationId}`;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/90 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900">{r.surveyCode}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {r.surveyDate} • {r.startTime || '--:--'} ({Math.round(r.durationSeconds / 60)}p)
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {locName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3" />
                          {r.interviewerName}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {r.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Hoàn thành
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-extrabold border border-rose-200">
                              <XCircle className="w-3.5 h-3.5" />
                              Screen-out
                            </span>
                            {r.screenoutReason && (
                              <div className="text-[10px] text-rose-600 font-semibold mt-0.5 max-w-[180px] truncate">
                                {r.screenoutReason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {r.status === 'completed' ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-800">
                              {getOptionLabel(S5_OPTIONS, r.S5)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {getOptionLabel(S6_OPTIONS, r.S6)} • {getOptionLabel(S7_OPTIONS, r.S7)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Dừng ở Phần S</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {r.status === 'completed' ? (
                          <div className="space-y-0.5">
                            <div className="text-slate-700">
                              <span className="font-bold text-slate-500">A1:</span>{' '}
                              <span className="font-bold text-slate-900">
                                {getOptionLabel(A1_OPTIONS, r.A1)}
                              </span>
                            </div>
                            <div className="text-slate-700">
                              <span className="font-bold text-slate-500">A4:</span>{' '}
                              {r.A2.includes(7) ? (
                                <span className="text-amber-700 font-bold">Chưa dùng F&B (A2=7)</span>
                              ) : (
                                <span className="font-bold text-emerald-700">
                                  {getOptionLabel(A1_OPTIONS, r.A4)}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {r.id.startsWith('PILOT_SAMPLE_') ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200">
                            Mẫu Pilot
                          </span>
                        ) : r.syncedToCloud ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                            <Cloud className="w-4 h-4" />
                            Cloud OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                            <CloudOff className="w-4 h-4" />
                            Cục bộ
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedResponse(r)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="Xem chi tiết phiếu"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Chi tiết phiếu khảo sát CAPI
                </span>
                <h3 className="text-lg font-black">{selectedResponse.surveyCode}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold block">Phỏng vấn viên</span>
                  <span className="font-extrabold text-slate-800">
                    {selectedResponse.interviewerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Điểm khảo sát</span>
                  <span className="font-extrabold text-slate-800">
                    {SURVEY_LOCATIONS.find((l) => l.id === selectedResponse.locationId)?.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Thời gian</span>
                  <span className="font-extrabold text-slate-800">
                    {selectedResponse.surveyDate} ({selectedResponse.startTime} -{' '}
                    {selectedResponse.endTime || '--:--'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Email PVV</span>
                  <span className="font-extrabold text-slate-800">
                    {selectedResponse.interviewerEmail || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Quà tặng</span>
                  <span className="font-extrabold text-slate-800">
                    {selectedResponse.giftName || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Trạng thái</span>
                  <span className="font-extrabold uppercase text-emerald-700">
                    {selectedResponse.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-slate-900 uppercase tracking-wider">
                  Phần S — Sàng lọc & Nhân khẩu học
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-semibold">S4 (Độ tuổi): </span>
                    <span className="font-bold text-slate-800">
                      {getOptionLabel(S4_OPTIONS, selectedResponse.S4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">S5 (Nguồn khách): </span>
                    <span className="font-bold text-slate-800">
                      {getOptionLabel(S5_OPTIONS, selectedResponse.S5)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">S6 (Đi cùng): </span>
                    <span className="font-bold text-slate-800">
                      {getOptionLabel(S6_OPTIONS, selectedResponse.S6)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold">S7 (Loại chuyến đi): </span>
                    <span className="font-bold text-slate-800">
                      {getOptionLabel(S7_OPTIONS, selectedResponse.S7)}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-semibold">S9 (Loại vé / Combo): </span>
                    <span className="font-bold text-slate-800">
                      {getOptionLabel(S9_OPTIONS, selectedResponse.S9)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedResponse.status === 'completed' && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 uppercase tracking-wider">
                      Phần A — Chi tiêu & Hành vi sử dụng F&B
                    </h4>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                      <div>
                        <span className="text-slate-400 font-semibold">A1 (Ngân sách dự kiến): </span>
                        <span className="font-bold text-slate-900">
                          {getOptionLabel(A1_OPTIONS, selectedResponse.A1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">A2 (Loại hình đã dùng): </span>
                        <span className="font-bold text-slate-900">
                          {selectedResponse.A2.map((c) => getOptionLabel(A2_OPTIONS, c)).join('; ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">A4 (Chi thực tế bình quân): </span>
                        <span className="font-bold text-emerald-700">
                          {getOptionLabel(A1_OPTIONS, selectedResponse.A4)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">
                          A4.1 (Chi thêm ngoài vé trọn gói):{' '}
                        </span>
                        <span className="font-bold text-slate-800">
                          {getOptionLabel(A1_OPTIONS, selectedResponse.A4_1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-black text-slate-900 uppercase tracking-wider">
                      Phần B & C — Điểm SERVQUAL (B5) & Đề xuất
                    </h4>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                        {Object.entries(selectedResponse.B5).map(([k, val]) => (
                          <div key={k} className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-[10px] font-bold text-slate-400">{k}</div>
                            <div className="text-sm font-black text-amber-600">{val ?? '—'}/5</div>
                          </div>
                        ))}
                      </div>
                      {selectedResponse.C4_note && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-slate-400 font-semibold block">
                            Ghi chú / Ý kiến mở (C4):
                          </span>
                          <p className="font-bold text-slate-800 mt-0.5">
                            {selectedResponse.C4_note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
