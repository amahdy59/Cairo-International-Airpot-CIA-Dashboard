import {
  Users,
  ShieldCheck,
  Zap,
  Clock3,
  Search,
  Download,
  AlertTriangle,
  Radio,
  Phone,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Award,
} from "lucide-react";
import { useStaffingRoster } from "../../hooks/useStaffingRoster";
import { useLocale } from "../../context/locale";
import { localize } from "../../utils/helpers";
import {
  MetricCard,
  SectionPanel,
  StatusPill,
  ProgressBar,
} from "../../components/command-center/MetricWidgets";

export default function StaffingView() {
  const { language, tr } = useLocale();
  const {
    filters,
    setActiveWave,
    setSearchQuery,
    setSelectedZone,
    setSelectedCertFilter,
    resetFilters,
    currentWave,
    shiftWaves,
    totalStaffOnDuty,
    icaoMetrics,
    filteredRoster,
    surgeUnits,
    dispatchSurgeUnit,
    recallSurgeUnit,
    toggleStaffStatus,
    exportRoster,
  } = useStaffingRoster(language);

  const isAr = language === "ar";

  return (
    <div className="flex flex-col gap-3 lg:gap-4 mt-3 lg:mt-4">
      {/* 1. Executive KPIs Row */}
      <section aria-label={tr("Staffing & Workforce Management")} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard
          label={tr("Total Staff on Duty")}
          value={totalStaffOnDuty}
          unit={`/ ${shiftWaves.find((w) => w.id === filters.activeWaveId)?.allocatedStaff ?? 442}`}
          hint={isAr ? "جميع مباني الركاب والمهابط" : "Across all terminals & apron stands"}
          icon={Users}
          accent="cyan"
          delta={isAr ? "+12 دعم إضافي" : "+12 surge support"}
          deltaTone="ok"
        />

        <MetricCard
          label={tr("Shift Wave Coverage")}
          value={`${Math.round(currentWave.coverageRatio * 100)}%`}
          hint={`${currentWave.allocatedStaff} ${isAr ? "موظف مخصص من" : "allocated of"} ${currentWave.requiredStaff} ${isAr ? "مطلوب" : "required"}`}
          icon={Clock3}
          accent={currentWave.coverageRatio < 0.9 ? "warn" : "ok"}
          delta={currentWave.coverageRatio < 0.9 ? (isAr ? "أقل من المستهدف (90%)" : "Below target (90%)") : (isAr ? "سعة كافية ومستقرة" : "Adequate capacity")}
          deltaTone={currentWave.coverageRatio < 0.9 ? "warn" : "ok"}
        />

        <MetricCard
          label={tr("ICAO Badge Compliance")}
          value={`${icaoMetrics.compliancePct}%`}
          hint={`${icaoMetrics.expiringSoon} ${isAr ? "يقترب من التجديد" : "expiring soon"} | ${icaoMetrics.expired} ${isAr ? "منتهي" : "expired"}`}
          icon={ShieldCheck}
          accent={icaoMetrics.expired > 0 ? "crit" : icaoMetrics.expiringSoon > 0 ? "warn" : "ok"}
          delta={icaoMetrics.expired > 0 ? (isAr ? "يتطلب تجديداً فورياً" : "Requires renewal") : (isAr ? "مطابق لمعايير الملحق 14" : "Annex 14 compliant")}
          deltaTone={icaoMetrics.expired > 0 ? "crit" : "ok"}
        />

        <MetricCard
          label={tr("Surge Response ETA")}
          value="2.5"
          unit={isAr ? "دقيقة" : "min"}
          hint={isAr ? "4 سرايا تدخل سريع جاهزة" : "4 tactical units on hot standby"}
          icon={Zap}
          accent="magenta"
          delta={isAr ? "جاهزية فورية (ICAO Cat 9)" : "Instant standby (Cat 9)"}
          deltaTone="ok"
        />
      </section>

      {/* 2. Shift Wave Allocator & Capacity Thresholds */}
      <SectionPanel
        title={tr("Shift Wave Allocator")}
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              {isAr ? "الموجة المختارة:" : "Selected:"} <strong className="text-foreground">{localize(currentWave.name, language)}</strong>
            </span>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {shiftWaves.map((wave) => {
            const isSelected = wave.id === filters.activeWaveId;
            const pct = Math.round(wave.coverageRatio * 100);
            const isUnderstaffed = pct < 90;

            return (
              <button
                key={wave.id}
                type="button"
                onClick={() => setActiveWave(wave.id)}
                aria-pressed={isSelected}
                className={`relative flex flex-col p-4 rounded-xl border text-start transition-all duration-200 cursor-pointer min-h-[44px] outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40"
                    : "bg-secondary/20 hover:bg-secondary/40 border-border/70"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {wave.hours}
                  </span>
                  <StatusPill tone={wave.statusTone}>
                    {pct}% {isAr ? "تغطية" : "Coverage"}
                  </StatusPill>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">
                  {localize(wave.name, language)}
                </h3>

                <p className="text-xs text-muted-foreground mb-3">
                  {isAr ? "المشرف المناوب:" : "Duty Lead:"} <strong className="text-foreground/90">{localize(wave.leadManager, language)}</strong> ({wave.leadCallsign})
                </p>

                <div className="mt-auto space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-muted-foreground">
                    <span>{isAr ? "رحلات الذروة:" : "Flight Load:"} {wave.flightLoad}</span>
                    <span>{wave.allocatedStaff} / {wave.requiredStaff}</span>
                  </div>
                  <ProgressBar
                    value={pct}
                    color={isUnderstaffed ? "var(--status-warn)" : "var(--status-ok)"}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Warning Callout when wave is under 90% */}
        {currentWave.coverageRatio < 0.9 && (
          <div
            role="alert"
            className="mt-3.5 flex items-start gap-3 rounded-lg border border-status-warn/40 bg-status-warn/10 p-3 text-status-warn"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs sm:text-sm">
              <strong className="font-bold">
                {isAr ? "تنبيه تشغيلي: سعة الوردية الحالية أقل من 90%" : "Shift Capacity Alert: Current wave is operating under 90%"}
              </strong>
              <p className="mt-0.5 text-foreground/80">
                {isAr
                  ? `وردية (${localize(currentWave.name, "ar")}) تسجل تغطية ${Math.round(currentWave.coverageRatio * 100)}% بالتزامن مع ${currentWave.flightLoad} رحلة. يُنصح بتفعيل سرايا التدخل السريع لمواكبة تسريع دوران المهابط والتفتيش الأمني.`
                  : `Wave (${localize(currentWave.name, "en")}) is at ${Math.round(currentWave.coverageRatio * 100)}% capacity with ${currentWave.flightLoad} peak flights. Deploy surge details below to protect departure on-time performance.`}
              </p>
            </div>
          </div>
        )}
      </SectionPanel>

      {/* 3. Emergency Surge Crew Fast Dispatcher */}
      <SectionPanel
        title={tr("Emergency Surge Crew Dispatch")}
        action={
          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-primary animate-pulse" aria-hidden="true" />
            {isAr ? "قناة الطوارئ: TETRA AOCC-SURGE" : "Tactical Dispatch: TETRA AOCC-SURGE"}
          </span>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {surgeUnits.map((unit) => {
            const isDispatched = unit.status === "dispatched";

            return (
              <article
                key={unit.id}
                className={`panel p-4 flex flex-col justify-between rounded-xl border transition-all duration-300 ${
                  isDispatched
                    ? "border-primary/60 bg-primary/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "border-border/60 bg-card hover:border-border"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <StatusPill tone={isDispatched ? "info" : "ok"}>
                      {isDispatched ? tr("Dispatched") : isAr ? "جاهز للانتشار" : "Ready"}
                    </StatusPill>
                    <span className="text-xs font-mono text-muted-foreground">
                      ETA {unit.dispatchEtaMin}m
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground mb-1 leading-snug">
                    {localize(unit.title, language)}
                  </h3>

                  <p className="text-xs text-muted-foreground mb-2">
                    {isAr ? "الهدف:" : "Zone:"} <strong className="text-foreground/90">{localize(unit.targetZoneLabel, language)}</strong>
                  </p>

                  <p className="text-xs text-foreground/75 mb-3 line-clamp-2">
                    {localize(unit.description, language)}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                  <div className="text-xs font-mono text-muted-foreground">
                    <span>{unit.headcount} {isAr ? "فرد" : "crew"}</span>
                    <span className="mx-1.5 opacity-40">|</span>
                    <span>{unit.leadCallsign}</span>
                  </div>

                  {isDispatched ? (
                    <button
                      type="button"
                      onClick={() => recallSurgeUnit(unit.id)}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-all active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{tr("Recall / Standby")}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => dispatchSurgeUnit(unit.id)}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold hover:brightness-110 shadow-xs transition-all active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{tr("Dispatch Crew")}</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </SectionPanel>

      {/* 4. Filterable Dynamic Roster Grid */}
      <SectionPanel
        title={tr("Dynamic Roster Grid")}
        action={
          <button
            type="button"
            onClick={exportRoster}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-secondary/30 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary/60 transition-all active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Download className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>{tr("Export Shift Roster (CSV)")}</span>
          </button>
        }
      >
        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-2.5 mb-4">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <label htmlFor="roster-search-input" className="sr-only">
              {tr("Search staff by name, callsign, or role...")}
            </label>
            <input
              id="roster-search-input"
              type="search"
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr("Search staff by name, callsign, or role...")}
              className="w-full h-11 ps-9 pe-4 rounded-lg border border-border bg-background/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Zone Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
            {(["ALL", "RAMP", "SECURITY", "T1", "T2", "T3", "BAGGAGE", "ARFF"] as const).map((zone) => {
              const isActive = filters.selectedZone === zone;
              const label = zone === "ALL" ? tr("All Zones") : zone;
              return (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setSelectedZone(zone)}
                  aria-pressed={isActive}
                  className={`min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "bg-secondary/20 hover:bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Cert Filter */}
          <div className="flex items-center gap-1">
            {(
              [
                { id: "ALL", label: isAr ? "الكل" : "All Certs" },
                { id: "expiring_soon", label: tr("Expiring Soon") },
                { id: "expired", label: tr("Expired") },
              ] as const
            ).map((item) => {
              const isActive = filters.selectedCertFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedCertFilter(item.id)}
                  aria-pressed={isActive}
                  className={`min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-secondary text-foreground border border-primary/50 shadow-xs"
                      : "bg-secondary/10 hover:bg-secondary/30 text-muted-foreground border border-border/40"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Filter Count for Screen Readers */}
        <div aria-live="polite" className="sr-only">
          {filteredRoster.length} staff members matching filters.
        </div>

        {/* Dynamic Table on Desktop / Cards on Mobile */}
        {filteredRoster.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border">
            <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">
              {isAr ? "لا توجد نتائج مطابقة لبحثك" : "No staff members match the selected filters"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAr ? "جرب تعديل معايير البحث أو تصفير المرشحات" : "Try modifying your search query or reset filter settings"}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {isAr ? "إعادة تعيين المرشحات" : "Reset Filters"}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-secondary/30 text-muted-foreground font-mono uppercase tracking-wider text-[11px]">
                  <th scope="col" className="p-3 text-start">{isAr ? "الموظف والنداء" : "Staff & Callsign"}</th>
                  <th scope="col" className="p-3 text-start">{isAr ? "المسمى والمنطقة" : "Role & Zone"}</th>
                  <th scope="col" className="p-3 text-start">{isAr ? "القناة والاتصال" : "Radio / Comm"}</th>
                  <th scope="col" className="p-3 text-start">{isAr ? "الحالة" : "Status"}</th>
                  <th scope="col" className="p-3 text-start">{isAr ? "ترخيص الإيكاو والصلاحية" : "ICAO Badge & Validity"}</th>
                  <th scope="col" className="p-3 text-end">{isAr ? "إجراء سريع" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-sans">
                {filteredRoster.map((member) => {
                  const isExpiring = member.certStatus === "expiring_soon";
                  const isExpired = member.certStatus === "expired";
                  const certTone = isExpired ? "crit" : isExpiring ? "warn" : "ok";

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      {/* Name & Callsign */}
                      <td className="p-3">
                        <div className="font-bold text-foreground text-sm">
                          {localize(member.name, language)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs font-mono text-muted-foreground">
                          <span className="text-primary font-semibold">{member.callsign}</span>
                          <span className="opacity-40">|</span>
                          <span>{member.id}</span>
                        </div>
                      </td>

                      {/* Role & Zone */}
                      <td className="p-3">
                        <div className="font-medium text-foreground">
                          {localize(member.roleTitle, language)}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="font-mono font-semibold text-foreground/80 bg-secondary/60 px-1.5 py-0.5 rounded">
                            {member.zone}
                          </span>
                          <span>{localize(member.zoneLabel, language)}</span>
                        </div>
                      </td>

                      {/* Radio Channel & Phone */}
                      <td className="p-3 font-mono text-xs">
                        <div className="flex items-center gap-1 text-foreground">
                          <Radio className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                          <span>{member.radioChannel}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span>{member.phoneExt}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <StatusPill tone={member.status === "on_duty" ? "ok" : member.status === "dispatched" ? "info" : "warn"}>
                          {member.status === "on_duty"
                            ? tr("On Duty")
                            : member.status === "break"
                            ? tr("Break")
                            : member.status === "dispatched"
                            ? tr("Dispatched")
                            : tr("Standby")}
                        </StatusPill>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          {member.safetyDaysZeroIncidents} {isAr ? "يوم بدون حوادث" : "days incident-free"}
                        </div>
                      </td>

                      {/* ICAO Badge & Validity */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <StatusPill tone={certTone}>
                            {isExpired ? tr("Expired") : isExpiring ? tr("Expiring Soon") : tr("Valid")}
                          </StatusPill>
                          <span className="font-mono text-xs font-bold text-foreground">
                            {member.daysToCertExpiry < 0
                              ? `${Math.abs(member.daysToCertExpiry)}d overdue`
                              : `${member.daysToCertExpiry}d left`}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-foreground/80 truncate max-w-xs" title={localize(member.badgeType, language)}>
                          {localize(member.badgeType, language)}
                        </div>
                      </td>

                      {/* Toggle status action */}
                      <td className="p-3 text-end">
                        <button
                          type="button"
                          onClick={() => toggleStaffStatus(member.id)}
                          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/50 transition-all active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          {member.status === "on_duty" ? (isAr ? "تحويل لاستراحة" : "Set Break") : (isAr ? "إعادة للخدمة" : "Set On Duty")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionPanel>

      {/* 5. ICAO Airside Safety & Permit Compliance Tracker */}
      <SectionPanel
        title={tr("ICAO Airside Safety & Permit Compliance Tracker")}
        action={
          <span className="text-xs font-mono text-status-ok flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            {isAr ? "معايير السلامة: ICAO Annex 14 / Annex 17" : "Standards: ICAO Annex 14 & 17"}
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border/70 bg-card">
            <div className="flex items-center gap-2 mb-2 text-foreground font-bold">
              <Award className="h-5 w-5 text-primary" aria-hidden="true" />
              <h4>{isAr ? "تراخيص قيادة المهابط (ADP Class 1 & 2)" : "Airside Driving Permits (ADP 1 & 2)"}</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "تراخيص القيادة المعتمدة لدخول ممرات التدحرج والمدرج النشط (05L/05C). تجديد دوري كل 24 شهراً مع اختبار كفاءة طبية وفحص اتصالات الراديو مع برج المراقبة."
                : "Mandatory driving authorizations for active runways (05L/05C) and taxiways. Bi-annual practical evaluation and VHF ATC radio protocol recertification."}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/70 bg-card">
            <div className="flex items-center gap-2 mb-2 text-foreground font-bold">
              <ShieldCheck className="h-5 w-5 text-status-ok" aria-hidden="true" />
              <h4>{isAr ? "تفتيش أمن الطيران (Annex 17 Level 3)" : "Aviation Security (Annex 17 L3)"}</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "شهادات مشغلي أجهزة الأشعة وكشف المفرقعات والمواد الخطرة. اختبارات فجائية شهرية لضمان معدلات ضبط 100% لكافة نقاط التفتيش بمباني الركاب 1 و2 و3."
                : "Continuous Threat Image Projection (TIP) certified screeners. Mandatory monthly proficiency drills for passenger and hold baggage X-ray systems."}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/70 bg-card">
            <div className="flex items-center gap-2 mb-2 text-foreground font-bold">
              <ShieldAlert className="h-5 w-5 text-status-warn" aria-hidden="true" />
              <h4>{isAr ? "الإطفاء والإنقاذ الجوي (Doc 9137 Cat 9)" : "ARFF Rescue & Fire (Doc 9137 Cat 9)"}</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isAr
                ? "فريق التدخل السريع لمكافحة حرائق الطائرات فئة 9 بقاعدة صقر 7. جاهزية استجابة فورية خلال 120 ثانية إلى أي نقطة على مهابط مطار القاهرة الدولي."
                : "Category 9 heavy aircraft rescue tender crews at Station 7 Falcon Base. 120-second rapid intervention mandate to any touchdown point at HECA."}
            </p>
          </div>
        </div>
      </SectionPanel>
    </div>
  );
}
