import React from 'react';
import {
  MapPin,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { SurveyResponseData } from '../data/surveySchema';
import { SurveySystemConfig } from '../services/surveyConfig';

interface QuotaDashboardProps {
  responses: SurveyResponseData[];
  config: SurveySystemConfig;
  currentInterviewerUid: string;
  currentInterviewerName: string;
  isSuperadmin?: boolean;
  onSeedPilotSamples: () => void;
  onClearPilotSamples: () => void;
}

export const QuotaDashboard: React.FC<QuotaDashboardProps> = ({
  responses,
  config,
  currentInterviewerUid,
  currentInterviewerName,
  isSuperadmin = false,
  onSeedPilotSamples,
  onClearPilotSamples,
}) => {
  const activeLocations = config.locations.filter((l) => l.active !== false);
  const totalQuotaTarget = config.dataFormat.totalQuotaTarget || 600;
  const dailyTargetPerPvv = config.dataFormat.dailyTargetPerPvv || 20;
  const validResponses = responses.filter((r) => r.status === 'completed');
  const screenoutResponses = responses.filter((r) => r.status === 'screenout');
  const totalValid = validResponses.length;
  const hasPilotSamples = responses.some((r) => r.id.startsWith('PILOT_SAMPLE_'));

  const todayStr = new Date().toISOString().slice(0, 10);
  const myTodayCount = validResponses.filter(
    (r) => r.interviewerUid === currentInterviewerUid && r.surveyDate === todayStr
  ).length;

  const domesticCount = validResponses.filter((r) => r.S5 !== null && r.S5 >= 1 && r.S5 <= 4).length;
  const intlCount = validResponses.filter((r) => r.S5 !== null && r.S5 >= 5).length;

  const s7Fit = validResponses.filter((r) => r.S7 === 1).length;
  const s7Tour = validResponses.filter((r) => r.S7 === 2).length;

  const renderBar = (label: string, current: number, target: number) => {
    const pct = Math.min(100, Math.round((current / Math.max(target, 1)) * 100));
    const done = current >= target;
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700">{label}</span>
          <span className="font-semibold text-slate-900">
            {current}/{target} ({pct}%)
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              done ? 'bg-emerald-600' : 'bg-[#d12f2f]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500">Tổng mẫu hợp lệ</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {totalValid} <span className="text-sm font-normal text-slate-400">/ {totalQuotaTarget}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500 truncate">Hôm nay ({currentInterviewerName})</div>
          <div className="text-2xl font-bold text-[#d12f2f] mt-1">
            {myTodayCount} <span className="text-sm font-normal text-slate-400">/ {dailyTargetPerPvv} mẫu</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500">Nội địa / Quốc tế</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {domesticCount} <span className="text-slate-300">/</span> {intlCount}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="text-xs text-slate-500">Dừng sàng lọc (Screen-out)</div>
          <div className="text-2xl font-bold text-slate-700 mt-1">{screenoutResponses.length}</div>
        </div>
      </div>

      {/* Superadmin Pilot Controls */}
      {isSuperadmin && (
        <div className="flex justify-end gap-2">
          {!hasPilotSamples ? (
            <button
              type="button"
              onClick={onSeedPilotSamples}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Nạp 30 mẫu Pilot thử nghiệm
            </button>
          ) : (
            <button
              type="button"
              onClick={onClearPilotSamples}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa 30 mẫu Pilot
            </button>
          )}
        </div>
      )}

      {/* 5 Điểm khảo sát & Cấu trúc nguồn khách */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#d12f2f]" />
            Tiến độ các điểm khảo sát ({activeLocations.length} điểm)
          </h3>
          <div className="space-y-2.5">
            {activeLocations.map((loc) => {
              const c = validResponses.filter((r) => r.locationId === loc.id).length;
              return <div key={loc.id}>{renderBar(loc.name, c, loc.quotaTarget)}</div>;
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Cơ cấu Nguồn khách &amp; Chuyến đi (n = {totalQuotaTarget})
          </h3>
          <div className="space-y-2.5">
            {renderBar('Khách Nội địa (45%)', domesticCount, Math.round(totalQuotaTarget * 0.45))}
            {renderBar('Khách Quốc tế (55%)', intlCount, Math.round(totalQuotaTarget * 0.55))}
            {renderBar('Khách Tự túc - FIT (60%)', s7Fit, Math.round(totalQuotaTarget * 0.6))}
            {renderBar('Khách đi Tour trọn gói (40%)', s7Tour, Math.round(totalQuotaTarget * 0.4))}
          </div>
        </div>
      </div>

      {/* Quốc tế ưu tiên & Nhóm đi cùng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Thị trường Quốc tế trọng điểm (~30 mẫu/nhóm)
          </h3>
          <div className="space-y-2.5">
            {renderBar('Hàn Quốc (S5=5)', validResponses.filter((r) => r.S5 === 5).length, 30)}
            {renderBar('Ấn Độ (S5=6)', validResponses.filter((r) => r.S5 === 6).length, 30)}
            {renderBar('Đông Nam Á (S5=7)', validResponses.filter((r) => r.S5 === 7).length, 30)}
            {renderBar('Đông Bắc Á khác (S5=8)', validResponses.filter((r) => r.S5 === 8).length, 30)}
            {renderBar('Âu / Mỹ / Úc (S5=9)', validResponses.filter((r) => r.S5 === 9).length, 30)}
            {renderBar('Nga / Russia (S5=11)', validResponses.filter((r) => r.S5 === 11).length, 30)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Nhóm đi cùng (S6)</h3>
          <div className="space-y-2.5">
            {renderBar('Nhóm bạn / Cặp đôi (30%)', validResponses.filter((r) => r.S6 === 4).length, 180)}
            {renderBar('Gia đình có trẻ em <12t (25%)', validResponses.filter((r) => r.S6 === 2).length, 150)}
            {renderBar('Đoàn khách / Công ty (20%)', validResponses.filter((r) => r.S6 === 5).length, 120)}
            {renderBar('Gia đình người lớn (15%)', validResponses.filter((r) => r.S6 === 3).length, 90)}
            {renderBar('Đi một mình - Solo (10%)', validResponses.filter((r) => r.S6 === 1).length, 60)}
          </div>
        </div>
      </div>
    </div>
  );
};
