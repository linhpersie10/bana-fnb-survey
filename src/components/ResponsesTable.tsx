import React, { useState, useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
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
  S5_OPTIONS,
  S7_OPTIONS,
  A1_OPTIONS,
  A4_OPTIONS,
  CustomQuestionCsvMeta,
  CsvExportOptions,
  exportResponsesToCsv,
  exportResponsesToExcel,
  getStructuredResponseDetailSections,
  buildStructuredReportColumns,
} from '../data/surveySchema';
import { SurveySystemConfig } from '../services/surveyConfig';
import { PageHeader, SectionCard } from './ui/ReportPrimitives';

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
  const s5Opts = config.questions.S5?.options || S5_OPTIONS;
  const s7Opts = config.questions.S7?.options || S7_OPTIONS;
  const a1Opts = config.questions.A1?.options || A1_OPTIONS;
  const a4Opts = config.questions.A4?.options || A4_OPTIONS;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'screenout' | 'unsynced'>(
    'all'
  );
  const [locationFilter, setLocationFilter] = useState<number | 'all'>('all');
  const [exportValueMode, setExportValueMode] = useState<
    'code_and_label' | 'code_only' | 'label_only'
  >(config.dataFormat.csvValueMode || 'code_and_label');
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponseData | null>(null);
  const [hideEmptyInModal, setHideEmptyInModal] = useState(false);

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

  const exportOptions = useMemo<CsvExportOptions>(() => {
    const questionOptionsMap: Record<string, OptionItem[]> = {};
    Object.entries(config.questions).forEach(([k, v]) => {
      questionOptionsMap[k] = v.options;
    });

    const orderedKeys = [...config.questionOrder];
    Object.keys(config.questions).forEach((k) => {
      if (!orderedKeys.includes(k)) {
        orderedKeys.push(k);
      }
    });

    const allQuestionsInOrder: CustomQuestionCsvMeta[] = orderedKeys
      .filter((k) => Boolean(config.questions[k]))
      .map((k) => {
        const q = config.questions[k];
        return {
          key: k,
          section: q.section,
          title: q.title,
          type: q.type,
          likertScale: q.likertScale,
          hasOtherInput: q.options.some((o) => o.hasOtherInput),
          isSubQuestion: Boolean(q.parentInfo?.parentQuestionKey),
          parentQuestionKey: q.parentInfo?.parentQuestionKey,
          options: q.options,
        };
      });

    return {
      delimiter: config.dataFormat.csvDelimiter || ',',
      valueMode: exportValueMode,
      multiSelectSeparator: config.dataFormat.multiSelectSeparator || '; ',
      locations: config.locations,
      questionOptionsMap,
      allQuestionsInOrder,
      includeQuestionTitleRow: true,
    };
  }, [config, exportValueMode]);

  const totalStructuredColumns = useMemo(
    () => buildStructuredReportColumns(filteredResponses, exportOptions).length,
    [filteredResponses, exportOptions]
  );

  const selectedDetailSections = useMemo(() => {
    if (!selectedResponse) return [];
    return getStructuredResponseDetailSections(selectedResponse, exportOptions);
  }, [selectedResponse, exportOptions]);

  const getOptionLabel = (options: OptionItem[], code: number | null) => {
    if (code === null) return '—';
    return options.find((o) => o.code === code)?.label || `Mã ${code}`;
  };

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title="Dữ liệu phiếu khảo sát & xuất báo cáo"
        meta={`${filteredResponses.length} phiếu hiển thị / ${responses.length} tổng bản ghi · ${totalStructuredColumns} cột dữ liệu có cấu trúc`}
        actions={
          <>
            <button
              type="button"
              onClick={() => void onSyncOffline()}
              disabled={isSyncing}
              className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingSyncCount > 0 ? `Đồng bộ (${pendingSyncCount})` : 'Đồng bộ'}</span>
            </button>

            {canExportAll && (
              <>
                <select
                  value={exportValueMode}
                  onChange={(e) =>
                    setExportValueMode(
                      e.target.value as 'code_and_label' | 'code_only' | 'label_only'
                    )
                  }
                  className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400"
                  title="Định dạng giá trị khi xuất CSV / Excel"
                >
                  <option value="code_and_label">Xuất: Mã + Nhãn (1 - Dưới 150k)</option>
                  <option value="code_only">Xuất: Chỉ Mã số SPSS/R (1)</option>
                  <option value="label_only">Xuất: Chỉ Nhãn chữ (Dưới 150k)</option>
                </select>

                <button
                  type="button"
                  disabled={filteredResponses.length === 0}
                  onClick={() => exportResponsesToCsv(filteredResponses, exportOptions)}
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>Xuất CSV ({filteredResponses.length})</span>
                </button>

                <button
                  type="button"
                  disabled={filteredResponses.length === 0}
                  onClick={() => exportResponsesToExcel(filteredResponses, exportOptions)}
                  className="h-8 px-3 rounded-lg bg-[#d12f2f] hover:bg-[#b82626] disabled:opacity-50 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>Xuất Excel ({filteredResponses.length})</span>
                </button>
              </>
            )}
          </>
        }
      />

      {/* Filter Bar */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-3 flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo mã phiếu, tên phỏng vấn viên, ghi chú C4..."
            className="h-8 w-full pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
        >
          <option value="all">Tất cả trạng thái ({responses.length})</option>
          <option value="completed">
            Hợp lệ ({responses.filter((r) => r.status === 'completed').length})
          </option>
          <option value="screenout">
            Dừng sàng lọc ({responses.filter((r) => r.status === 'screenout').length})
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
          className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
        >
          <option value="all">Tất cả điểm khảo sát</option>
          {config.locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <SectionCard
        title="Danh sách bản ghi khảo sát"
        meta={`${filteredResponses.length} bản ghi`}
        tone="ocean"
        bodyClassName="p-0"
      >
        {filteredResponses.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            Chưa có bản ghi khảo sát nào khớp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 font-medium text-slate-500">
                  <th className="py-2.5 px-4">Mã phiếu</th>
                  <th className="py-2.5 px-3">Điểm trực &amp; PVV</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3">Thị trường (S5) &amp; Hình thức (S7)</th>
                  <th className="py-2.5 px-3">Dự kiến (A1) &amp; Thực tế (A4)</th>
                  <th className="py-2.5 px-3">Đồng bộ</th>
                  <th className="py-2.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResponses.map((r) => {
                  const locName =
                    config.locations.find((l) => l.id === r.locationId)?.name ||
                    `Điểm ${r.locationId}`;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="font-mono text-[11px] font-semibold text-slate-900">
                          {r.surveyCode}
                        </div>
                        <div className="text-[11px] text-slate-400 tabular-nums">
                          {r.surveyDate} · {r.startTime?.slice(0, 5)} ({r.durationSeconds}s)
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{locName}</div>
                        <div className="text-[11px] text-slate-400">{r.interviewerName}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        {r.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/80">
                            <CheckCircle2 className="w-3 h-3" />
                            Hợp lệ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-medium border border-rose-200/80">
                            <XCircle className="w-3 h-3" />
                            Dừng sàng lọc
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-slate-700">
                        {r.status === 'completed' ? (
                          <>
                            <div className="font-medium">{getOptionLabel(s5Opts, r.S5)}</div>
                            <div className="text-[11px] text-slate-400">
                              {getOptionLabel(s7Opts, r.S7)}
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400">{r.screenoutReason || '—'}</span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-slate-700 tabular-nums">
                        {r.status === 'completed' ? (
                          <>
                            <div className="text-slate-600">
                              A1: {getOptionLabel(a1Opts, r.A1)}
                            </div>
                            <div className="text-slate-900 font-medium">
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

                      <td className="py-2.5 px-3">
                        {r.syncedToCloud ? (
                          <Cloud className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <CloudOff className="w-4 h-4 text-amber-500" />
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedResponse(r)}
                            className="h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                            title="Xem đầy đủ 100% câu trả lời"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Chi tiết</span>
                          </button>
                          {canDelete && onDeleteResponse && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Xóa phiếu ${r.surveyCode}?`)) {
                                  void onDeleteResponse(r.id);
                                }
                              }}
                              className="h-7 w-7 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 inline-flex items-center justify-center cursor-pointer transition-colors"
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
      </SectionCard>

      {/* Full 100% Structured Response Detail Modal */}
      {selectedResponse && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center p-3 sm:p-5"
          onClick={() => setSelectedResponse(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[86vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-4 py-3 bg-slate-100/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-mono font-semibold text-xs">
                  {selectedResponse.surveyCode}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-900 truncate">
                    Chi tiết phiếu khảo sát
                  </div>
                  <div className="text-xs text-slate-500 tabular-nums">
                    Ngày {selectedResponse.surveyDate} · {selectedResponse.startTime} →{' '}
                    {selectedResponse.endTime} ({selectedResponse.durationSeconds}s) · PVV:{' '}
                    {selectedResponse.interviewerName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={hideEmptyInModal}
                    onChange={(e) => setHideEmptyInModal(e.target.checked)}
                    className="rounded accent-[#d12f2f]"
                  />
                  Ẩn câu bỏ trống
                </label>

                <button
                  type="button"
                  onClick={() => exportResponsesToExcel([selectedResponse], exportOptions)}
                  className="h-7 px-2.5 rounded-lg bg-[#d12f2f] hover:bg-[#b82626] text-white text-xs font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Xuất Excel phiếu này
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedResponse(null)}
                  className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 inline-flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Structured Sections */}
            <div className="p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
              {selectedDetailSections.map((sec) => {
                const visibleFields = hideEmptyInModal
                  ? sec.fields.filter((f) => !f.isEmpty)
                  : sec.fields;
                if (visibleFields.length === 0) return null;

                return (
                  <div
                    key={sec.section}
                    className="bg-white rounded-xl border border-slate-200/80 overflow-hidden"
                  >
                    <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200/80 flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{sec.sectionTitle}</span>
                      <span className="text-xs text-slate-500 tabular-nums">
                        {visibleFields.filter((f) => !f.isEmpty).length}/{sec.fields.length}{' '}
                        trường có dữ liệu
                      </span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {visibleFields.map((field) => (
                        <div
                          key={field.code}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-3 px-4 py-2 hover:bg-slate-50/80"
                        >
                          <div className="sm:col-span-5 flex items-start gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/80 font-mono text-[11px] font-medium text-slate-600 shrink-0">
                              {field.code}
                            </span>
                            <span className="text-slate-600 font-medium leading-snug">
                              {field.label}
                            </span>
                          </div>
                          <div className="sm:col-span-7 font-medium text-slate-900 leading-snug break-words">
                            {field.isEmpty ? (
                              <span className="text-slate-400 font-normal">—</span>
                            ) : (
                              field.value
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
