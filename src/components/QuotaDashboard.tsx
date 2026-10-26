import React from 'react';
import {
  BarChart3,
  Users,
  MapPin,
  Target,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { SurveyResponseData, SURVEY_LOCATIONS, S9_OPTIONS } from '../data/surveySchema';

interface QuotaDashboardProps {
  responses: SurveyResponseData[];
  currentInterviewerUid: string;
  currentInterviewerName: string;
  onSeedPilotSamples: () => void;
  onClearPilotSamples: () => void;
}

export const QuotaDashboard: React.FC<QuotaDashboardProps> = ({
  responses,
  currentInterviewerUid,
  currentInterviewerName,
  onSeedPilotSamples,
  onClearPilotSamples,
}) => {
  const validResponses = responses.filter((r) => r.status === 'completed');
  const screenoutResponses = responses.filter((r) => r.status === 'screenout');
  const totalValid = validResponses.length;
  const hasPilotSamples = responses.some((r) => r.id.startsWith('PILOT_SAMPLE_'));

  const todayStr = new Date().toISOString().slice(0, 10);
  const myTodayCount = validResponses.filter(
    (r) => r.interviewerUid === currentInterviewerUid && r.surveyDate === todayStr
  ).length;

  // 1. Nguồn khách (Nội địa S5=1..4 vs Quốc tế S5>=5)
  const domesticCount = validResponses.filter((r) => r.S5 !== null && r.S5 >= 1 && r.S5 <= 4).length;
  const intlCount = validResponses.filter((r) => r.S5 !== null && r.S5 >= 5).length;

  // Chi tiết Quốc tế ưu tiên (~30 mẫu/nhóm)
  const koreaCount = validResponses.filter((r) => r.S5 === 5).length;
  const indiaCount = validResponses.filter((r) => r.S5 === 6).length;
  const seaCount = validResponses.filter((r) => r.S5 === 7).length;
  const neAsiaCount = validResponses.filter((r) => r.S5 === 8).length;
  const westernCount = validResponses.filter((r) => r.S5 === 9).length;
  const russiaCount = validResponses.filter((r) => r.S5 === 11).length;

  // 2. Nhóm đi cùng (S6)
  const s6FamilyKids = validResponses.filter((r) => r.S6 === 2).length; // 25% = 150
  const s6FamilyAdults = validResponses.filter((r) => r.S6 === 3).length; // 15% = 90
  const s6FriendsCouple = validResponses.filter((r) => r.S6 === 4).length; // 30% = 180
  const s6GroupCompany = validResponses.filter((r) => r.S6 === 5).length; // 20% = 120
  const s6Solo = validResponses.filter((r) => r.S6 === 1).length; // 10% = 60

  // 3. Hình thức chuyến đi (S7)
  const s7Fit = validResponses.filter((r) => r.S7 === 1).length; // 60% = 360
  const s7Tour = validResponses.filter((r) => r.S7 === 2).length; // 40% = 240

  // 4. Độ tuổi (S4)
  const age18_25 = validResponses.filter((r) => r.S4 === 2).length; // >=25% = 150
  const age26_45 = validResponses.filter((r) => r.S4 === 3 || r.S4 === 4).length; // ~50% = 300
  const ageOver45 = validResponses.filter((r) => r.S4 === 5 || r.S4 === 6).length; // ~25% = 150

  // 5. Giới tính (S3)
  const maleCount = validResponses.filter((r) => r.S3 === 1).length; // 50% = 300
  const femaleCount = validResponses.filter((r) => r.S3 === 2).length; // 50% = 300

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-up">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Tổng Mẫu Hợp Lệ (Toàn Chiến Dịch)</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {totalValid} <span className="text-base font-semibold text-slate-400">/ 600 mẫu</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalValid / 600) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>KPI Cá Nhân Hôm Nay ({currentInterviewerName})</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {myTodayCount}{' '}
            <span className="text-base font-semibold text-slate-400">/ 20 mẫu/ngày</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${Math.min(100, (myTodayCount / 20) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Tỷ Lệ Nội Địa / Quốc Tế</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {domesticCount} Nội địa · {intlCount} Quốc tế
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Mục tiêu Quota: 300 Nội địa (50%) – 300 Quốc tế (50%)
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
            <span>Lượt Dừng Sàng Lọc (Screen-out)</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">
            {screenoutResponses.length}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Do khách đi &lt; 4 tiếng, người khác trả tiền hoặc &lt; 18 tuổi
          </div>
        </div>
      </div>

      {/* Pilot Sample Generator Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Công cụ Kiểm thử Khảo sát thử (Pilot 30–40 mẫu theo Phụ lục 1)
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Bạn có thể nạp nhanh 30 mẫu khảo sát thử (Pilot) để kiểm tra trực quan biểu đồ phân bổ
            Quota và xuất thử file CSV/Excel trước khi chạy chính thức.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!hasPilotSamples ? (
            <button
              type="button"
              onClick={onSeedPilotSamples}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Nạp 30 Mẫu Pilot Thử Nghiệm</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClearPilotSamples}
              className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-200 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa 30 Mẫu Pilot Thử Nghiệm</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Quota Allocation Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Điểm khảo sát (5 điểm) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span>1. Phân Bổ Theo 5 Điểm Khảo Sát (20% / điểm ≈ 120 mẫu)</span>
          </h3>
          <div className="space-y-3.5">
            {SURVEY_LOCATIONS.map((loc) => {
              const count = validResponses.filter((r) => r.locationId === loc.id).length;
              return (
                <QuotaProgressBar
                  key={loc.id}
                  label={loc.name}
                  current={count}
                  target={loc.quotaTarget}
                  totalValid={totalValid}
                  targetPct={20}
                />
              );
            })}
          </div>
        </div>

        {/* Nguồn khách & Quốc tịch chính */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>2. Nguồn Khách Nội Địa vs Quốc Tế (S5)</span>
          </h3>
          <div className="space-y-3.5">
            <QuotaProgressBar
              label="Khách Nội địa (Đà Nẵng, Bắc, Trung, Nam)"
              current={domesticCount}
              target={300}
              totalValid={totalValid}
              targetPct={50}
            />
            <QuotaProgressBar
              label="Khách Quốc tế (Tổng)"
              current={intlCount}
              target={300}
              totalValid={totalValid}
              targetPct={50}
            />
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Hàn Quốc</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {koreaCount} / ~30+
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Đông Nam Á</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {seaCount} / ~30+
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Âu / Mỹ / Úc</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {westernCount} / ~30+
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Nga / Russia</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {russiaCount} / ~30+
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Ấn Độ</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {indiaCount} / ~30+
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Đông Bắc Á khác</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {neAsiaCount} / ~30+
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nhóm đi cùng (S6) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-900 mb-4">
            3. Nhóm Đi Cùng (S6 — Quota Đề Xuất)
          </h3>
          <div className="space-y-3.5">
            <QuotaProgressBar
              label="Gia đình có trẻ em (<12 tuổi)"
              current={s6FamilyKids}
              target={150}
              totalValid={totalValid}
              targetPct={25}
            />
            <QuotaProgressBar
              label="Gia đình người lớn / đa thế hệ"
              current={s6FamilyAdults}
              target={90}
              totalValid={totalValid}
              targetPct={15}
            />
            <QuotaProgressBar
              label="Nhóm bạn / cặp đôi"
              current={s6FriendsCouple}
              target={180}
              totalValid={totalValid}
              targetPct={30}
            />
            <QuotaProgressBar
              label="Đoàn khách / công ty"
              current={s6GroupCompany}
              target={120}
              totalValid={totalValid}
              targetPct={20}
            />
            <QuotaProgressBar
              label="Đi một mình (Solo traveler)"
              current={s6Solo}
              target={60}
              totalValid={totalValid}
              targetPct={10}
            />
          </div>
        </div>

        {/* Hình thức chuyến đi, Độ tuổi, Giới tính */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-3">
              4. Hình Thức Chuyến Đi (S7) &amp; Độ Tuổi (S4) &amp; Giới Tính (S3)
            </h3>
            <div className="space-y-3">
              <QuotaProgressBar
                label="Tự túc (FIT — 60%)"
                current={s7Fit}
                target={360}
                totalValid={totalValid}
                targetPct={60}
              />
              <QuotaProgressBar
                label="Tour trọn gói (Đã gồm ăn trưa — 40%)"
                current={s7Tour}
                target={240}
                totalValid={totalValid}
                targetPct={40}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <QuotaProgressBar
              label="Độ tuổi 18 – 25 tuổi (≥ 25%)"
              current={age18_25}
              target={150}
              totalValid={totalValid}
              targetPct={25}
            />
            <QuotaProgressBar
              label="Độ tuổi 26 – 45 tuổi (≈ 50%)"
              current={age26_45}
              target={300}
              totalValid={totalValid}
              targetPct={50}
            />
            <QuotaProgressBar
              label="Độ tuổi Trên 45 tuổi (≈ 25%)"
              current={ageOver45}
              target={150}
              totalValid={totalValid}
              targetPct={25}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Nam (Quota ~50%):</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {maleCount} / 300 mẫu
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Nữ (Quota ~50%):</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {femaleCount} / 300 mẫu
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gói vé sử dụng (S9) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-3">
          5. Theo Dõi Gói Vé Sử Dụng (S9 — Mỗi gói chính tối thiểu ~50 mẫu)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {S9_OPTIONS.map((opt) => {
            const count = validResponses.filter((r) => r.S9 === opt.code).length;
            return (
              <div
                key={opt.code}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
              >
                <div className="text-xs font-bold text-slate-800">{opt.label}</div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs shrink-0">
                  {count} mẫu
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const QuotaProgressBar: React.FC<{
  label: string;
  current: number;
  target: number;
  totalValid: number;
  targetPct: number;
}> = ({ label, current, target, totalValid, targetPct }) => {
  const actualPct = totalValid > 0 ? Math.round((current / totalValid) * 100) : 0;
  const fillPct = Math.min(100, Math.round((current / target) * 100));

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-bold text-slate-800">{label}</span>
        <span className="font-mono font-bold text-slate-600">
          {current}/{target} mẫu ({actualPct}% thực tế vs {targetPct}% Quota)
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
          style={{ width: `${fillPct}%` }}
        />
      </div>
    </div>
  );
};
