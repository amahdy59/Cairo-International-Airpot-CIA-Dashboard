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
import { RosterStatusWaffle } from "./RosterStatusWaffle";
import { SelectMenu } from "../../components/common/SelectMenu";
import type { AirsideZoneId, StaffMember } from "../../data";
import {
  MetricCard,
  SectionPanel,
  StatusPill,
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
    roster,
    filteredRoster,
    surgeUnits,
    dispatchSurgeUnit,
    recallSurgeUnit,
    toggleStaffStatus,
    exportRoster,
    isDrillActive,
    activeScenario,
  } = useStaffingRoster(language);

  const isAr = language === "ar";
  const readyUnits = surgeUnits.filter(unit => unit.status === "ready");
  const averageReadyEta = readyUnits.length
    ? (readyUnits.reduce((sum, unit) => sum + unit.dispatchEtaMin, 0) / readyUnits.length).toFixed(1)
    : "—";
  const hasRosterFilters = Boolean(filters.searchQuery || filters.selectedZone !== "ALL" || filters.selectedCertFilter !== "ALL");
  const zoneOptions: { value: AirsideZoneId | "ALL"; label: string }[] = ["ALL", "RAMP", "SECURITY", "T1", "T2", "T3", "BAGGAGE", "ARFF"].map(zone => ({
    value: zone as AirsideZoneId | "ALL",
    label: zone === "ALL" ? (isAr ? "كل المناطق" : "All zones") : zone,
  }));
  const certOptions: { value: "ALL" | "valid" | "expiring_soon" | "expired"; label: string }[] = [
    { value: "ALL", label: isAr ? "كل التصاريح" : "All badges" },
    { value: "valid", label: tr("Valid") },
    { value: "expiring_soon", label: tr("Expiring Soon") },
    { value: "expired", label: tr("Expired") },
  ];

  return (
    <div className="flex flex-col gap-3 lg:gap-4 mt-3 lg:mt-4">
      {/* 1. Executive KPIs Row */}
      <section aria-label={tr("Staffing & Workforce Management")} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard
          label={isAr ? "الموجودون ضمن العينة" : "Sample roster on duty"}
          value={totalStaffOnDuty}
          unit={`/ ${icaoMetrics.total}`}
          hint={isAr ? "من سجلات النموذج التجريبي" : "Of prototype roster entries"}
          icon={Users}
          accent="cyan"
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
          label={isAr ? "صلاحية تصاريح العينة" : "Sample badge validity"}
          value={`${icaoMetrics.compliancePct}%`}
          hint={`${icaoMetrics.expiringSoon} ${isAr ? "يقترب من التجديد" : "expiring soon"} | ${icaoMetrics.expired} ${isAr ? "منتهي" : "expired"}`}
          icon={ShieldCheck}
          accent={icaoMetrics.expired > 0 ? "crit" : icaoMetrics.expiringSoon > 0 ? "warn" : "ok"}
          delta={icaoMetrics.expired > 0 ? (isAr ? "يتطلب تجديداً فورياً" : "Requires renewal") : (isAr ? "لا تصاريح منتهية في العينة" : "No expired badges in sample")}
          deltaTone={icaoMetrics.expired > 0 ? "crit" : "ok"}
        />

        <MetricCard
          label={isAr ? "متوسط وصول التعزيز" : "Avg ready-unit ETA"}
          value={averageReadyEta}
          unit={readyUnits.length ? (isAr ? "دقيقة" : "min") : undefined}
          hint={isAr ? `${readyUnits.length} فرق جاهزة` : `${readyUnits.length} ready units`}
          icon={Zap}
          accent="magenta"
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

                <div className="mt-auto pt-4 space-y-2">
                  <div role="img" aria-label={isAr
                    ? `${localize(wave.name, language)}: ${wave.allocatedStaff} مخصص من ${wave.requiredStaff} مطلوب، تغطية ${pct}٪، الهدف ٩٠٪`
                    : `${localize(wave.name, language)}: ${wave.allocatedStaff} allocated of ${wave.requiredStaff} required, ${pct}% coverage, 90% target`}
                    className="relative h-3.5 rounded-full bg-secondary">
                    <div aria-hidden="true" className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: isUnderstaffed ? "var(--status-warn)" : "var(--status-ok)" }} />
                    <span aria-hidden="true" className="absolute start-[90%] -top-1 h-5 w-0.5 bg-foreground" />
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs tabular-nums text-muted-foreground">
                    <span><strong className="text-foreground">{wave.allocatedStaff}</strong> / {wave.requiredStaff} {isAr ? "موظف" : "staff"}</span>
                    <span>{isAr ? "الهدف ٩٠٪" : "90% target"}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <span>{isAr ? "مشرف النوبة:" : "Duty lead:"} <strong className="text-foreground">{localize(currentWave.leadManager, language)}</strong> <span className="font-mono">{currentWave.leadCallsign}</span></span>
          <span>{isAr ? "رحلات الذروة:" : "Peak flights:"} <strong className="text-foreground tabular-nums">{currentWave.flightLoad}</strong></span>
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
                  ? `العجز ${currentWave.requiredStaff - currentWave.allocatedStaff} موظف؛ راجع فرق التعزيز أدناه.`
                  : `${currentWave.requiredStaff - currentWave.allocatedStaff} staff short. Review surge crews below.`}
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
        {isDrillActive && (
          <div
            role="alert"
            className="mb-3.5 flex items-start gap-3 rounded-xl border border-status-crit/40 bg-status-crit/10 p-3.5 text-status-crit"
          >
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs sm:text-sm">
              <strong className="font-bold">
                {isAr ? `تنبيه خطة الطوارئ للمحاكاة: ${localize(activeScenario.title, "ar")}` : `Drill Contingency Protocol: ${localize(activeScenario.title, "en")}`}
              </strong>
              <p className="mt-0.5 text-foreground/80">
                {isAr
                  ? `يقترح السيناريو مراجعة فرق الدعم المتاحة. لا يرسل هذا النموذج أي فرق ميدانية.`
                  : `The scenario suggests reviewing available surge teams. This prototype does not dispatch crews.`}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {surgeUnits.map((unit) => {
            const isDispatched = unit.status === "dispatched";

            return (
              <article
                key={unit.id}
                className={`panel p-4 flex flex-col justify-between rounded-xl border transition-all duration-300 ${
                  unit.isRecommended
                    ? "ring-2 ring-status-crit/60 border-status-crit/40 bg-status-crit/5"
                    : isDispatched
                      ? "border-primary/60 bg-primary/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : "border-border/60 bg-card hover:border-border"
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1.5">
                      <StatusPill tone={isDispatched ? "info" : "ok"}>
                        {isDispatched ? (isAr ? "مخصص في المحاكاة" : "Assigned in simulation") : isAr ? "متاح في المحاكاة" : "Available in simulation"}
                      </StatusPill>
                      {unit.isRecommended && (
                        <StatusPill tone="crit">
                          {isAr ? "أولوية المحاكاة" : "Drill Priority"}
                        </StatusPill>
                      )}
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {isAr ? "وقت افتراضي" : "Model ETA"} {unit.dispatchEtaMin}m
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
                      <span>{isAr ? "إلغاء التخصيص" : "Undo assignment"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => dispatchSurgeUnit(unit.id)}
                      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold hover:brightness-110 shadow-xs transition-all active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isAr ? "تخصيص في المحاكاة" : "Assign in simulation"}</span>
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
        title={isAr ? "سجل العاملين التدريبي" : "Sample staff roster"}
        action={
          <button
            type="button"
            onClick={exportRoster}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-secondary/30 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary/60 transition-all active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Download className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>{isAr ? "تصدير عينة العاملين (CSV)" : "Export sample roster (CSV)"}</span>
          </button>
        }
      >
        <RosterStatusWaffle roster={roster} />
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_11rem_11rem]">
          <div className="relative min-w-0 sm:col-span-2 xl:col-span-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
            <label htmlFor="roster-search-input" className="sr-only">
              {tr("Search staff by name, callsign, or role...")}
            </label>
            <input
              id="roster-search-input"
              type="search"
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث بالاسم أو النداء أو الدور" : "Search name, callsign, or role"}
              className="w-full h-11 ps-9 pe-4 rounded-lg border border-border bg-background/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="roster-zone" className="sr-only">{isAr ? "منطقة العمل" : "Work zone"}</label>
            <SelectMenu id="roster-zone" label={isAr ? "منطقة العمل" : "Work zone"} value={filters.selectedZone} options={zoneOptions} onChange={setSelectedZone} className="w-full" />
          </div>
          <div className="min-w-0">
            <label htmlFor="roster-badge" className="sr-only">{isAr ? "حالة التصريح" : "Badge status"}</label>
            <SelectMenu id="roster-badge" label={isAr ? "حالة التصريح" : "Badge status"} value={filters.selectedCertFilter} options={certOptions} onChange={setSelectedCertFilter} className="w-full" />
          </div>
        </div>
        <div className="mb-3 mt-2 flex min-h-8 items-center justify-between gap-2 text-xs text-muted-foreground" aria-live="polite">
          <span>{isAr ? `${filteredRoster.length} من أفراد النوبة` : `${filteredRoster.length} staff in selected wave`}</span>
          {hasRosterFilters && <button type="button" onClick={resetFilters} className="min-h-11 rounded-lg px-3 font-semibold text-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{isAr ? "مسح المرشحات" : "Clear filters"}</button>}
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
          <>
          <div className="grid gap-2.5 sm:grid-cols-2 xl:hidden" aria-label={isAr ? "بطاقات سجل الموظفين" : "Staff roster cards"}>
            {filteredRoster.map(member => <StaffRosterCard key={member.id} member={member} onToggle={() => toggleStaffStatus(member.id)} />)}
          </div>
          <div className="table-scroll hidden rounded-xl border border-border bg-card xl:block" role="region" tabIndex={0} aria-label={isAr ? "سجل الموظفين" : "Staff roster"}>
            <table className="w-full min-w-[1120px] table-fixed border-collapse text-start text-xs">
              <colgroup><col style={{ width: "18%" }} /><col style={{ width: "22%" }} /><col style={{ width: "16%" }} /><col style={{ width: "12%" }} /><col style={{ width: "21%" }} /><col style={{ width: "11%" }} /></colgroup>
              <thead>
                <tr className="border-b border-border/80 bg-secondary/30 text-muted-foreground font-mono uppercase tracking-wider text-[11px]">
                  <th scope="col" className="p-3 text-start">{isAr ? "الموظف والنداء" : "Staff & Callsign"}</th>
                  <th scope="col" className="p-3 text-start">{isAr ? "المسمى والمنطقة" : "Role & Zone"}</th>
                  <th scope="col" className="p-3 text-start">{isAr ? "القناة والاتصال" : "Radio / Comm"}</th>
                  <th scope="col" className="p-3 text-start">{isAr ? "الحالة" : "Status"}</th>
                  <th scope="col" className="p-3 text-start">{isAr ? "التأهيل وتاريخ الانتهاء" : "Qualification & expiry"}</th>
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
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs font-mono text-muted-foreground">
                          <span className="text-primary font-semibold break-all">{member.callsign}</span>
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
                          <span className="break-words">{member.radioChannel}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <span className="break-words">{member.phoneExt}</span>
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
                              ? (isAr ? `${Math.abs(member.daysToCertExpiry)} يوم تأخير` : `${Math.abs(member.daysToCertExpiry)}d overdue`)
                              : (isAr ? `${member.daysToCertExpiry} يوم متبقٍ` : `${member.daysToCertExpiry}d left`)}
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
                          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center whitespace-nowrap rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/50 transition-all active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
          </>
        )}
      </SectionPanel>

      {/* 5. ICAO Airside Safety & Permit Compliance Tracker */}
      <SectionPanel
        title={isAr ? "مراجعة تأهيل العاملين" : "Staff qualification review"}
        action={
          <span className="text-xs font-mono text-status-ok flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            {isAr ? "سجلات تدريبية · تحقق من القواعد المحلية" : "Sample records · verify local rules"}
          </span>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border/70 bg-card">
            <div className="flex items-center gap-2 mb-2 text-foreground font-bold">
              <Award className="h-5 w-5 text-primary" aria-hidden="true" />
              <h4>{isAr ? "تصاريح القيادة في الجانب الجوي" : "Airside driving permits"}</h4>
            </div>
            <details className="mt-1 text-xs text-muted-foreground"><summary className="flex min-h-11 cursor-pointer items-center font-semibold text-primary">{isAr ? "عرض المتطلبات" : "View requirements"}</summary><p className="pb-2 leading-relaxed">
              {isAr
                ? "راجع تصريح القيادة والتأهيل العملي وجدول التجديد مع جهة المطار المختصة."
                : "Confirm driving authorization, practical competency, and renewal dates with the responsible airport authority."}
            </p></details>
          </div>

          <div className="p-4 rounded-xl border border-border/70 bg-card">
            <div className="flex items-center gap-2 mb-2 text-foreground font-bold">
              <ShieldCheck className="h-5 w-5 text-status-ok" aria-hidden="true" />
              <h4>{isAr ? "تأهيل التفتيش الأمني" : "Security screening qualification"}</h4>
            </div>
            <details className="mt-1 text-xs text-muted-foreground"><summary className="flex min-h-11 cursor-pointer items-center font-semibold text-primary">{isAr ? "عرض المتطلبات" : "View requirements"}</summary><p className="pb-2 leading-relaxed">
              {isAr
                ? "راجع تدريب المفتشين وفحوص الكفاءة ومتطلبات إعادة التأهيل مع الجهة الأمنية المختصة."
                : "Confirm screener training, proficiency checks, and recertification rules with the security authority."}
            </p></details>
          </div>

          <div className="p-4 rounded-xl border border-border/70 bg-card">
            <div className="flex items-center gap-2 mb-2 text-foreground font-bold">
              <ShieldAlert className="h-5 w-5 text-status-warn" aria-hidden="true" />
              <h4>{isAr ? "جاهزية الإنقاذ والإطفاء" : "Rescue and firefighting readiness"}</h4>
            </div>
            <details className="mt-1 text-xs text-muted-foreground"><summary className="flex min-h-11 cursor-pointer items-center font-semibold text-primary">{isAr ? "عرض المتطلبات" : "View requirements"}</summary><p className="pb-2 leading-relaxed">
              {isAr
                ? "راجع فئة التغطية والموارد وأهداف الاستجابة والتدريب المتكرر وفق خطة طوارئ المطار المعتمدة."
                : "Confirm coverage category, resources, response targets, and recurrent training against the approved aerodrome emergency plan."}
            </p></details>
          </div>
        </div>
      </SectionPanel>
    </div>
  );
}

function StaffRosterCard({ member, onToggle }: { member: StaffMember; onToggle: () => void }) {
  const { language, tr } = useLocale();
  const isAr = language === "ar";
  const isExpired = member.certStatus === "expired";
  const isExpiring = member.certStatus === "expiring_soon";
  const status = member.status === "on_duty" ? tr("On Duty") : member.status === "break" ? tr("Break") : member.status === "dispatched" ? tr("Dispatched") : tr("Standby");
  const badge = isExpired ? tr("Expired") : isExpiring ? tr("Expiring Soon") : tr("Valid");
  const remaining = member.daysToCertExpiry < 0
    ? (isAr ? `${Math.abs(member.daysToCertExpiry)} يوم تأخير` : `${Math.abs(member.daysToCertExpiry)}d overdue`)
    : (isAr ? `${member.daysToCertExpiry} يوم متبقٍ` : `${member.daysToCertExpiry}d left`);

  return <article className="min-w-0 rounded-xl border border-border bg-card p-3.5">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <h3 className="break-words text-sm font-bold text-foreground">{localize(member.name, language)}</h3>
        <p className="mt-0.5 break-all font-mono text-xs text-primary">{member.callsign}</p>
      </div>
      <StatusPill tone={member.status === "on_duty" ? "ok" : member.status === "dispatched" ? "info" : "warn"}>{status}</StatusPill>
    </div>
    <p className="mt-2 text-sm leading-snug text-foreground">{localize(member.roleTitle, language)}</p>
    <p className="mt-1 text-xs text-muted-foreground"><span className="font-mono font-semibold text-foreground">{member.zone}</span> · {localize(member.zoneLabel, language)}</p>
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
      <StatusPill tone={isExpired ? "crit" : isExpiring ? "warn" : "ok"}>{badge}</StatusPill>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">{remaining}</span>
    </div>
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
      <details className="min-w-0 text-xs text-muted-foreground">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-primary">{isAr ? "تفاصيل الاتصال والتصريح" : "Contact & badge details"}</summary>
        <dl className="grid gap-2 pb-2">
          <div><dt className="font-semibold">{isAr ? "قناة الاتصال" : "Radio"}</dt><dd className="break-words font-mono">{member.radioChannel}</dd></div>
          <div><dt className="font-semibold">{isAr ? "الهاتف" : "Phone"}</dt><dd className="break-words font-mono">{member.phoneExt}</dd></div>
          <div><dt className="font-semibold">{isAr ? "نوع التصريح" : "Badge"}</dt><dd className="break-words">{localize(member.badgeType, language)}</dd></div>
          <div><dt className="font-semibold">{isAr ? "سجل السلامة" : "Safety record"}</dt><dd>{member.safetyDaysZeroIncidents} {isAr ? "يوم بدون حوادث" : "incident-free days"}</dd></div>
        </dl>
      </details>
      <button type="button" onClick={onToggle} className="min-h-11 shrink-0 rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" aria-label={`${member.status === "on_duty" ? (isAr ? "تحويل إلى استراحة" : "Set break for") : (isAr ? "إعادة إلى الخدمة" : "Set on duty for")} ${localize(member.name, language)}`}>
        {member.status === "on_duty" ? (isAr ? "استراحة" : "Set break") : (isAr ? "إلى الخدمة" : "Set on duty")}
      </button>
    </div>
  </article>;
}
