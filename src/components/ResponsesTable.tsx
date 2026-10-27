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
  Trash2,
} from 'lucide-react';
import {
  SurveyResponseData,
  OptionItem,
  S4_OPTIONS,
  S5_OPTIONS,
  S6_OPTIONS,
  S7_OPTIONS,
  S9_OPTIONS,
  A1_OPTIONS,
  A2_OPTIONS,
  A4_OPTIONS,
  CustomQuestionCsvMeta,
  exportResponsesToCsv,
} from '../data/surveySchema';
import { SurveySystemConfig, DEFAULT_QUESTION_ORDER } from '../services/surveyConfig';

interface ResponsesTableProps {
  responses: SurveyResponseData[];
  config: SurveySystemConfig;
  isSyncing: boolean;
  canExportAll?: boolean;
  canDelete?: boolean;
  onSyncOffline: () => Promise<void>;
  onDeleteResponse?: (id: string) => Promise<void>;
}

export const ResponsesTable: React.FC<ResponsesTableProps> = ({
  responses,
  config,
  isSyncing,
  canExportAll = true,
  canDelete = false,
  onSyncOffline,
  onDeleteResponse,
}) => {
  const s4Opts = config.questions.S4?.options || S4_OPTIONS;
  const s5Opts = config.questions.S5?.options || S5_OPTIONS;
  const s6Opts = config.questions.S6?.options || S6_OPTIONS;
  const s7Opts = config.questions.S7?.options || S7_OPTIONS;
  const s9Opts = config.questions.S9?.options || S9_OPTIONS;
  const a1Opts = config.questions.A1?.options || A1_OPTIONS;
  const a2Opts = config.questions.A2?.options || A2_OPTIONS;
  const a4Opts = config.questions.A4?.options || A4_OPTIONS;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'screenout' | 'unsynced'>(
    'all'
  );
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
        const matchNote = r.C4_note.toLowerCase().includes(q);
        if (!matchCode && !matchPvv && !matchNote) return false;
      }
      return true;
    });
  }, [responses, statusFilter, locationFilter, searchQuery]);

  const getOptionLabel = (options: OptionItem[], code: number | null) => {
    if (code === null) return '—';
    return options.find((o) => o.code === code)?.label || `Mã ${code}`;
  };

  return (
    <div className="space-y-3.5 pb-12">
      {/* Compact Toolbar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã phiếu, tên PVV..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="all">Tất cả ({responses.length})</option>
            <option value="completed">
              Hợp lệ ({responses.filter((r) => r.status === 'completed').length})
            </option>
            <option value="screenout">
              Screen-out ({responses.filter((r) => r.status === 'screenout').length})
            </option>
            <option value="unsynced">
              Chờ đồng bộ ({responses.filter((r) => !r.syncedToCloud).length})
            </option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) =>
              setLocationFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
          >
            <option value="all">Tất cả điểm khảo sát</option>
            {config.locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void onSyncOffline()}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {pendingSyncCount > 0 ? `Đồng bộ (${pendingSyncCount})` : 'Đồng bộ'}
          </button>

          {canExportAll && (
            <button
              type="button"
              onClick={() => {
                if (filteredResponses.length === 0) return;
                const questionOptionsMap: Record<string, OptionItem[]> = {};
                Object.entries(config.questions).forEach(([k, v]) => {
                  questionOptionsMap[k] = v.options;
                });
                const customQuestions: CustomQuestionCsvMeta[] = config.questionOrder
                  .filter((k) => !DEFAULT_QUESTION_ORDER.includes(k) && config.questions[k])
                  .map((k) => ({
                    key: k,
                    title: config.questions[k].title,
                    type: config.questions[k].type,
                    options: config.questions[k].options,
                  }));
                exportResponsesToCsv(filteredResponses, {
                  delimiter: config.dataFormat.csvDelimiter,
                  valueMode: config.dataFormat.csvValueMode,
                  multiSelectSeparator: config.dataFormat.multiSelectSeparator,
                  locations: config.locations,
                  questionOptionsMap,
                  customQuestions,
                });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#d12f2f] hover:bg-[#b82626] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất CSV ({filteredResponses.length})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filteredResponses.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Chưa có bản ghi khảo sát nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500">
                  <th className="py-2.5 px-3.5">Mã phiếu</th>
                  <th className="py-2.5 px-3.5">Điểm trực &amp; Đáp viên</th>
                  <th className="py-2.5 px-3.5">Trạng thái</th>
                  <th className="py-2.5 px-3.5">Khách (S5 / S7)</th>
                  <th className="py-2.5 px-3.5">A1 vs A4</th>
                  <th className="py-2.5 px-3.5">Cloud</th>
                  <th className="py-2.5 px-3.5 text-right">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResponses.map((r) => {
                  const locName =
                    config.locations.find((l) => l.id === r.locationId)?.name ||
                    `Điểm ${r.locationId}`;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3.5">
                        <div className="font-semibold text-slate-900">{r.surveyCode}</div>
                        <div className="text-[11px] text-slate-400">
                          {r.surveyDate} • {r.startTime?.slice(0, 5)}
                        </div>
                      </td>

                      <td className="py-2.5 px-3.5">
                        <div className="font-medium text-slate-800">{locName}</div>
                        <div className="text-[11px] text-slate-400">{r.interviewerName}</div>
                      </td>

                      <td className="py-2.5 px-3.5">
                        {r.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Hợp lệ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Screen-out
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3.5 text-slate-700">
                        {r.status === 'completed' ? (
                          <>
                            <div className="font-medium">{getOptionLabel(s5Opts, r.S5)}</div>
                            <div className="text-[11px] text-slate-400">
                              {getOptionLabel(s7Opts, r.S7)}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3.5 text-slate-700">
                        {r.status === 'completed' ? (
                          <>
                            <div>A1: {getOptionLabel(a1Opts, r.A1)}</div>
                            <div className="text-emerald-700 font-medium">
                              A4:{' '}
                              {r.A2.includes(7)
                                ? 'Chưa dùng F&B'
                                : getOptionLabel(a4Opts, r.A4)}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3.5">
                        {r.syncedToCloud ? (
                          <Cloud className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <CloudOff className="w-4 h-4 text-amber-500" />
                        )}
                      </td>

                      <td className="py-2.5 px-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedResponse(r)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canDelete && onDeleteResponse && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Xóa phiếu ${r.surveyCode}?`)) {
                                  void onDeleteResponse(r.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        )}
      </div>

      {/* Compact Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[82vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
              <div className="font-bold text-sm">{selectedResponse.surveyCode}</div>
              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Đáp viên</span>
                  <strong className="text-slate-800">{selectedResponse.interviewerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Điểm khảo sát</span>
                  <strong className="text-slate-800">
                    {config.locations.find((l) => l.id === selectedResponse.locationId)?.name}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Độ tuổi (S4)</span>
                  <strong className="text-slate-800">
                    {getOptionLabel(s4Opts, selectedResponse.S4)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Nguồn khách (S5)</span>
                  <strong className="text-slate-800">
                    {getOptionLabel(s5Opts, selectedResponse.S5)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Đi cùng (S6)</span>
                  <strong className="text-slate-800">
                    {getOptionLabel(s6Opts, selectedResponse.S6)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Loại vé (S9)</span>
                  <strong className="text-slate-800">
                    {getOptionLabel(s9Opts, selectedResponse.S9)}
                  </strong>
                </div>
              </div>

              {selectedResponse.status === 'completed' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div>
                    <span className="text-slate-400">A1 (Dự kiến): </span>
                    <strong className="text-slate-800">
                      {getOptionLabel(a1Opts, selectedResponse.A1)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">A2 (Đã dùng): </span>
                    <strong className="text-slate-800">
                      {selectedResponse.A2.map((c) => getOptionLabel(a2Opts, c)).join('; ')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">A4 (Thực tế): </span>
                    <strong className="text-emerald-700">
                      {getOptionLabel(a4Opts, selectedResponse.A4)}
                    </strong>
                  </div>
                  {selectedResponse.C4_note && (
                    <div>
                      <span className="text-slate-400">Ghi chú: </span>
                      <strong className="text-slate-800">{selectedResponse.C4_note}</strong>
                    </div>
                  )}
                  {selectedResponse.customAnswers &&
                    Object.entries(selectedResponse.customAnswers).map(([k, val]) => {
                      if (val === null || val === undefined || val === '') return null;
                      const qMeta = config.questions[k];
                      const displayVal = Array.isArray(val)
                        ? val
                            .map((c) => getOptionLabel(qMeta?.options || [], c))
                            .join('; ')
                        : typeof val === 'number' && qMeta?.type !== 'text'
                        ? getOptionLabel(qMeta?.options || [], val)
                        : String(val);
                      return (
                        <div key={k}>
                          <span className="text-slate-400">
                            {qMeta?.title || k}:{' '}
                          </span>
                          <strong className="text-slate-800">{displayVal}</strong>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
