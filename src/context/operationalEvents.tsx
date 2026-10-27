/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LocalizedText, TerminalId } from "../data";
import { useSimulation } from "./simulation";
import { INITIAL_STAND_ASSIGNMENTS, simulateApronDiversion, type ApronStandAssignment } from "../data/apronStands";

export type AirportRole = "manager" | "airside" | "terminal" | "baggage" | "safety" | "staffing";
export type EventState = "open" | "assigned" | "simulated";
export type EventDomain = "airside" | "passenger" | "baggage" | "safety" | "landside";
export type EventPriority = "critical" | "high" | "medium";

export interface OperationalEvent {
  id: string;
  title: LocalizedText;
  domain: EventDomain;
  role: Exclude<AirportRole, "manager">;
  priority: EventPriority;
  terminal: TerminalId | "landside";
  flightIds: string[];
  standIds: string[];
  impact: LocalizedText;
  evidence: LocalizedText;
  proposedAction: LocalizedText;
  passengerImpact: LocalizedText;
  source: LocalizedText;
  sampleTime: string;
  state: EventState;
  history: { time: string; description: LocalizedText }[];
}

const sampleSource = { en: "Training scenario record", ar: "سجل سيناريو تدريبي" };
const makeEvent = (event: Omit<OperationalEvent, "source" | "state" | "history">): OperationalEvent => ({
  ...event,
  source: sampleSource,
  state: "open",
  history: [{ time: event.sampleTime, description: { en: "Flagged in the sample scenario", ar: "سُجّل في السيناريو التدريبي" } }],
});

export const BASE_OPERATIONAL_EVENTS: OperationalEvent[] = [
  makeEvent({ id: "stand-305-306", title: { en: "Stand assignment conflict · 305–306", ar: "تعارض تخصيص الموقفين 305–306" }, domain: "airside", role: "airside", priority: "critical", terminal: "T3", flightIds: ["SV302", "EK927"], standIds: ["S-305", "S-306"], impact: { en: "EK927 and SV302 share a flagged adjacent stand pair.", ar: "الرحلتان EK927 وSV302 في موقفين متجاورين معلّمين كتعارض." }, evidence: { en: "Scenario flag only; stand geometry and measured separation are unavailable.", ar: "تنبيه من السيناريو فقط؛ أبعاد المواقف ومسافات الفصل المقاسة غير متاحة." }, proposedAction: { en: "Check stand fit and movement route, then simulate moving EK927 to R-14.", ar: "تحقق من ملاءمة الموقف والمسار، ثم حاكِ نقل EK927 إلى R-14." }, passengerImpact: { en: "Gate and bus arrangements may need review if the stand changes.", ar: "قد تتطلب ترتيبات البوابة والحافلات مراجعة عند تغيير الموقف." }, sampleTime: "14:10" }),
  makeEvent({ id: "gate-b12", title: { en: "Gate B12 boarding risk", ar: "خطر تأخر الصعود في البوابة B12" }, domain: "airside", role: "airside", priority: "high", terminal: "T3", flightIds: ["MS777"], standIds: ["B12"], impact: { en: "Compressed boarding window may affect the departure and connections.", ar: "ضيق وقت الصعود قد يؤثر في المغادرة والرحلات المتصلة." }, evidence: { en: "Sample inbound is 18 minutes behind the stand target.", ar: "الوصول في العينة متأخر ١٨ دقيقة عن وقت الموقف المستهدف." }, proposedAction: { en: "Review ramp runner and boarding staff allocation.", ar: "راجع تخصيص عامل الساحة وموظفي الصعود." }, passengerImpact: { en: "Connection assistance may be needed for affected passengers.", ar: "قد يحتاج الركاب المتأثرون إلى مساعدة في الرحلات المتصلة." }, sampleTime: "14:10" }),
  makeEvent({ id: "t2-security", title: { en: "T2 security queue rising", ar: "ارتفاع طابور الأمن بمبنى 2" }, domain: "passenger", role: "terminal", priority: "high", terminal: "T2", flightIds: [], standIds: [], impact: { en: "Passengers may reach passport control later than planned.", ar: "قد يصل الركاب إلى الجوازات بعد الموعد المخطط." }, evidence: { en: "Sample queue wait: 17 minutes.", ar: "زمن الانتظار في العينة: ١٧ دقيقة." }, proposedAction: { en: "Review opening a screening lane and available staff.", ar: "راجع فتح مسار فحص وتوافر الموظفين." }, passengerImpact: { en: "Security is the pressure point in the departing journey.", ar: "الفحص الأمني هو نقطة الضغط في رحلة المغادرة." }, sampleTime: "14:15" }),
  makeEvent({ id: "parking-congestion", title: { en: "Parking entry queue", ar: "ازدحام مدخل المواقف" }, domain: "landside", role: "terminal", priority: "medium", terminal: "landside", flightIds: [], standIds: [], impact: { en: "Access to the departure curb may slow.", ar: "قد يتباطأ الوصول إلى رصيف المغادرة." }, evidence: { en: "Scenario queue exceeds 15 vehicles.", ar: "طابور السيناريو يتجاوز ١٥ مركبة." }, proposedAction: { en: "Review traffic warden coverage at the entry split.", ar: "راجع توزيع مرشدي الحركة عند مدخل المواقف." }, passengerImpact: { en: "Allow more travel time to check-in if congestion persists.", ar: "قد يحتاج الركاب إلى وقت أطول للوصول إلى التسجيل إذا استمر الازدحام." }, sampleTime: "14:02" }),
  makeEvent({ id: "t1-stand-turnaround", title: { en: "T1 remote stand turnaround pressure", ar: "ضغط تجهيز موقف بعيد بمبنى 1" }, domain: "airside", role: "staffing", priority: "medium", terminal: "T1", flightIds: [], standIds: [], impact: { en: "Fuel and catering overlap may compress ground time.", ar: "تداخل الوقود والتموين قد يضغط وقت التجهيز." }, evidence: { en: "Scenario stand team is 9 minutes behind its milestone.", ar: "فريق الموقف في السيناريو متأخر ٩ دقائق عن المرحلة." }, proposedAction: { en: "Review reassignment of one available ground support unit.", ar: "راجع نقل وحدة دعم أرضي متاحة." }, passengerImpact: { en: "A late turnaround can delay boarding.", ar: "تأخر التجهيز قد يؤخر الصعود." }, sampleTime: "14:00" }),
  makeEvent({ id: "t2-scanner", title: { en: "T2-B screening scanner offline", ar: "توقف ماسح الفحص T2-B" }, domain: "safety", role: "safety", priority: "high", terminal: "T2", flightIds: [], standIds: [], impact: { en: "Screening capacity is reduced in Terminal 2.", ar: "انخفضت سعة الفحص الأمني بمبنى 2." }, evidence: { en: "Sample safety check flags one offline scanner.", ar: "فحص السلامة في العينة يشير إلى توقف ماسح واحد." }, proposedAction: { en: "Assign maintenance and confirm alternate lane coverage.", ar: "كلف الصيانة وتحقق من تغطية مسار بديل." }, passengerImpact: { en: "Queue pressure may rise while capacity is reduced.", ar: "قد يرتفع ضغط الطابور حتى استعادة السعة." }, sampleTime: "14:12" }),
];

const BAGGAGE_EVENT = makeEvent({ id: "t3-baggage", title: { en: "T3 baggage sorter interruption", ar: "توقف فرز الحقائب بمبنى 3" }, domain: "baggage", role: "baggage", priority: "critical", terminal: "T3", flightIds: ["MS778", "SV302"], standIds: [], impact: { en: "Manual transfer may delay loading for affected flights.", ar: "النقل اليدوي قد يؤخر تحميل الرحلات المتأثرة." }, evidence: { en: "Baggage failure training scenario is active.", ar: "سيناريو تدريب عطل الأمتعة نشط." }, proposedAction: { en: "Assign a manual-transfer team and review affected flight milestones.", ar: "كلف فريق النقل اليدوي وراجع مراحل الرحلات المتأثرة." }, passengerImpact: { en: "Baggage delivery and departure reliability may be affected.", ar: "قد يتأثر تسليم الحقائب وانتظام المغادرة." }, sampleTime: "14:20" });
const WEATHER_EVENT = makeEvent({ id: "low-visibility", title: { en: "Low-visibility procedure drill", ar: "تدريب إجراءات الرؤية المنخفضة" }, domain: "safety", role: "safety", priority: "critical", terminal: "T3", flightIds: [], standIds: [], impact: { en: "Ground movement and departure sequencing need review.", ar: "تتطلب الحركة الأرضية وتسلسل المغادرة مراجعة." }, evidence: { en: "Sandstorm training scenario is active.", ar: "سيناريو تدريب العاصفة الرملية نشط." }, proposedAction: { en: "Review the low-visibility checklist and affected movements.", ar: "راجع قائمة إجراءات الرؤية المنخفضة والحركات المتأثرة." }, passengerImpact: { en: "Departure delays and missed connections are possible in the scenario.", ar: "قد تحدث تأخيرات ومواعيد اتصال فائتة في السيناريو." }, sampleTime: "14:20" });

export function eventsForScenario(scenarioId: string): OperationalEvent[] {
  const events = BASE_OPERATIONAL_EVENTS.map((event) => ({ ...event, history: [...event.history] }));
  if (scenarioId === "baggage-failure") events.push(BAGGAGE_EVENT);
  if (scenarioId === "sandstorm") events.push(WEATHER_EVENT);
  return events;
}

interface OperationalContextValue {
  events: OperationalEvent[];
  role: AirportRole;
  setRole: (role: AirportRole) => void;
  selectedEventId: string | null;
  selectEvent: (id: string | null) => void;
  assignEvent: (id: string) => void;
  simulateStandMove: () => void;
  resetExercise: () => void;
  standAssignments: ApronStandAssignment[];
  standForFlight: (flightId: string) => string | undefined;
}

const OperationalContext = createContext<OperationalContextValue | null>(null);
const actionTime = () => new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date());

export function OperationalProvider({ children }: { children: ReactNode }) {
  const { scenarioId } = useSimulation();
  const [events, setEvents] = useState(() => eventsForScenario(scenarioId));
  const [role, setRole] = useState<AirportRole>("manager");
  const [selectedEventId, selectEvent] = useState<string | null>(null);
  const [standMoved, setStandMoved] = useState(false);

  useEffect(() => {
    setEvents(eventsForScenario(scenarioId));
    setStandMoved(false);
    selectEvent(null);
  }, [scenarioId]);

  const assignEvent = useCallback((id: string) => {
    setEvents((previous) => previous.map((event) => event.id === id && event.state === "open" ? {
      ...event, state: "assigned" as const,
      history: [...event.history, { time: actionTime(), description: { en: `Assigned to ${event.role} team in simulation`, ar: `أُسند إلى فريق ${event.role} في المحاكاة` } }],
    } : event));
  }, []);

  const simulateStandMove = useCallback(() => {
    setStandMoved(true);
    setEvents((previous) => previous.map((event) => event.id === "stand-305-306" && event.state !== "simulated" ? {
      ...event, state: "simulated" as const,
      history: [...event.history, { time: actionTime(), description: { en: "EK927 moved to R-14 in simulation; actual fit is unverified", ar: "نُقلت EK927 إلى R-14 في المحاكاة؛ الملاءمة الفعلية لم تُتحقق" } }],
    } : event));
  }, []);

  const resetExercise = useCallback(() => {
    setEvents(eventsForScenario(scenarioId));
    setStandMoved(false);
    selectEvent(null);
  }, [scenarioId]);

  const standAssignments = useMemo(() => standMoved ? simulateApronDiversion(INITIAL_STAND_ASSIGNMENTS) : INITIAL_STAND_ASSIGNMENTS, [standMoved]);
  const standForFlight = useCallback((flightId: string) => standAssignments.find((stand) => stand.flight === flightId)?.gate, [standAssignments]);
  const value = useMemo(() => ({ events, role, setRole, selectedEventId, selectEvent, assignEvent, simulateStandMove, resetExercise, standAssignments, standForFlight }), [events, role, selectedEventId, assignEvent, simulateStandMove, resetExercise, standAssignments, standForFlight]);
  return <OperationalContext.Provider value={value}>{children}</OperationalContext.Provider>;
}

export function useOperationalEvents() {
  const context = useContext(OperationalContext);
  if (!context) throw new Error("useOperationalEvents must be used within OperationalProvider");
  return context;
}
