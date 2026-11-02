import React from 'react';
import { SurveyResponseData } from '../data/surveySchema';
import { SurveySystemConfig } from '../services/surveyConfig';
import { PageHeader, StatCard, SectionCard } from './ui/ReportPrimitives';

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

  const domesticCount = validResponses.filter(
    (r) => r.S5 !== null && r.S5 >= 1 && r.S5 <= 4
  ).length;
  const intlCount = validResponses.filter((r) => r.S5 !== null && r.S5 >= 5).length;

  const s7Fit = validResponses.filter((r) => r.S7 === 1).length;
  const s7Tour = validResponses.filter((r) => r.S7 === 2).length;

  const renderBar = (label: string, current: number, target: number, barHex = '#0891b2') => {
    const pct = Math.min(100, Math.round((current / Math.max(target, 1)) * 100));
    const done = current >= target;
    return (
      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="font-medium text-slate-700 truncate">{label}</span>
          <span className="font-semibold text-slate-900 tabular-nums shrink-0">
            {current} / {target}{' '}
            <span className="font-normal text-slate-400">({pct}%)</span>
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: done ? '#10b981' : barHex,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-12">
      <PageHeader
        title="Tiến độ chỉ tiêu mẫu (Quota)"
        meta={`${totalValid} phiếu hợp lệ / ${totalQuotaTarget} chỉ tiêu · ${activeLocations.length} điểm khảo sát`}
        actions={
          isSuperadmin ? (
            !hasPilotSamples ? (
              <button
                type="button"
                onClick={onSeedPilotSamples}
                className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition-colors"
              >
                + Nạp 30 mẫu thử
              </button>
            ) : (
              <button
                type="button"
                onClick={onClearPilotSamples}
                className="h-8 px-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium cursor-pointer transition-colors"
              >
                Xóa 30 mẫu thử
              </button>
            )
          ) : undefined
        }
      />

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Tổng mẫu hợp lệ"
          tone="ocean"
          value={totalValid}
          subValue={`/ ${totalQuotaTarget}`}
          note={`Đạt ${Math.round((totalValid / Math.max(totalQuotaTarget, 1)) * 100)}% chỉ tiêu tổng`}
        />

        <StatCard
          label={`Hôm nay (${currentInterviewerName})`}
          tone="brand"
          value={myTodayCount}
          subValue={`/ ${dailyTargetPerPvv} mẫu`}
          note={`Ngày ${todayStr}`}
        />

        <StatCard
          label="Nội địa / Quốc tế (S5)"
          tone="iris"
          value={`${domesticCount} / ${intlCount}`}
          note="Chỉ tiêu: 45% Nội địa · 55% Quốc tế"
        />

        <StatCard
          label="Dừng sàng lọc (Screen-out)"
          tone="neutral"
          value={screenoutResponses.length}
          note="Không trực tiếp chi trả F&B (S2=3)"
        />
      </div>

      {/* 5 Điểm khảo sát & Cấu trúc nguồn khách */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard
          title="Tiến độ theo điểm khảo sát"
          meta={`${activeLocations.length} điểm`}
          tone="brand"
        >
          <div className="space-y-3">
            {activeLocations.map((loc) => {
              const c = validResponses.filter((r) => r.locationId === loc.id).length;
              return (
                <div key={loc.id}>
                  {renderBar(loc.name, c, loc.quotaTarget, '#d12f2f')}
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          title="Cơ cấu nguồn khách & hình thức chuyến đi"
          meta={`n = ${totalQuotaTarget}`}
          tone="ocean"
        >
          <div className="space-y-3">
            {renderBar(
              'Khách Nội địa (45%)',
              domesticCount,
              Math.round(totalQuotaTarget * 0.45),
              '#0891b2'
            )}
            {renderBar(
              'Khách Quốc tế (55%)',
              intlCount,
              Math.round(totalQuotaTarget * 0.55),
              '#6366f1'
            )}
            {renderBar(
              'Khách Tự túc — FIT (60%)',
              s7Fit,
              Math.round(totalQuotaTarget * 0.6),
              '#0891b2'
            )}
            {renderBar(
              'Khách đi Tour trọn gói (40%)',
              s7Tour,
              Math.round(totalQuotaTarget * 0.4),
              '#6366f1'
            )}
          </div>
        </SectionCard>
      </div>

      {/* Quốc tế ưu tiên & Nhóm đi cùng */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard
          code="S5"
          title="Thị trường Quốc tế trọng điểm"
          meta="~30 mẫu / nhóm"
          tone="iris"
        >
          <div className="space-y-3">
            {renderBar(
              'Hàn Quốc (S5=5)',
              validResponses.filter((r) => r.S5 === 5).length,
              30,
              '#6366f1'
            )}
            {renderBar(
              'Ấn Độ (S5=6)',
              validResponses.filter((r) => r.S5 === 6).length,
              30,
              '#6366f1'
            )}
            {renderBar(
              'Đông Nam Á (S5=7)',
              validResponses.filter((r) => r.S5 === 7).length,
              30,
              '#6366f1'
            )}
            {renderBar(
              'Đông Bắc Á khác: Trung, Đài, Nhật (S5=8)',
              validResponses.filter((r) => r.S5 === 8).length,
              30,
              '#6366f1'
            )}
            {renderBar(
              'Âu / Mỹ / Úc (S5=9)',
              validResponses.filter((r) => r.S5 === 9).length,
              30,
              '#6366f1'
            )}
            {renderBar(
              'Nga / Russia (S5=11)',
              validResponses.filter((r) => r.S5 === 11).length,
              30,
              '#6366f1'
            )}
          </div>
        </SectionCard>

        <SectionCard
          code="S6"
          title="Cơ cấu nhóm đi cùng"
          meta={`n = ${totalQuotaTarget}`}
          tone="success"
        >
          <div className="space-y-3">
            {renderBar(
              'Nhóm bạn / Cặp đôi (30%)',
              validResponses.filter((r) => r.S6 === 4).length,
              180,
              '#10b981'
            )}
            {renderBar(
              'Gia đình có trẻ em <12 tuổi (25%)',
              validResponses.filter((r) => r.S6 === 2).length,
              150,
              '#10b981'
            )}
            {renderBar(
              'Đoàn khách / Công ty (20%)',
              validResponses.filter((r) => r.S6 === 5).length,
              120,
              '#10b981'
            )}
            {renderBar(
              'Gia đình người lớn (15%)',
              validResponses.filter((r) => r.S6 === 3).length,
              90,
              '#10b981'
            )}
            {renderBar(
              'Đi một mình — Solo (10%)',
              validResponses.filter((r) => r.S6 === 1).length,
              60,
              '#10b981'
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
