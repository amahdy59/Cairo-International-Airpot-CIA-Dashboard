import { useState, useMemo, useCallback } from 'react';
import {
  departures,
  arrivals,
  influxForecastRows,
  gateWaitRows,
  queueRows,
  FlightRow,
  Language,
} from '../data';
import { exportToCsv } from '../utils/exportCsv';
import { soundEffects } from '../services/soundEffects';

export function useOperationsMetrics(language: Language = 'en') {
  const [departuresSearch, setDeparturesSearch] = useState('');
  const [arrivalsSearch, setArrivalsSearch] = useState('');

  // 1. Filtered flight schedules
  const filteredDepartures = useMemo(() => {
    const q = departuresSearch.trim().toLowerCase();
    if (!q) return departures;
    return departures.filter(
      (f) =>
        f.flight.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        f.gate.toLowerCase().includes(q) ||
        f.status.toLowerCase().includes(q)
    );
  }, [departuresSearch]);

  const filteredArrivals = useMemo(() => {
    const q = arrivalsSearch.trim().toLowerCase();
    if (!q) return arrivals;
    return arrivals.filter(
      (f) =>
        f.flight.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        f.gate.toLowerCase().includes(q) ||
        f.status.toLowerCase().includes(q)
    );
  }, [arrivalsSearch]);

  // 2. Mathematical forecast line calculation (pure Bézier geometry)
  const forecastGeometry = useMemo(() => {
    const values = influxForecastRows.flatMap((row) => [row.current, row.forecast]);
    const min = Math.min(...values) - 100;
    const max = Math.max(...values) + 100;
    const span = max - min || 1;
    const width = 420;
    const height = 150;

    const getPoint = (value: number, index: number): [number, number] => {
      const x = 18 + (index / (influxForecastRows.length - 1)) * (width - 36);
      const y = height - 18 - ((value - min) / span) * (height - 38);
      return [x, y];
    };

    const createSmoothPath = (coords: [number, number][]) => {
      if (coords.length === 0) return '';
      let d = `M ${coords[0][0]},${coords[0][1]}`;
      for (let i = 1; i < coords.length; i++) {
        const p1 = coords[i - 1];
        const p2 = coords[i];
        const cpX = (p1[0] + p2[0]) / 2;
        d += ` C ${cpX},${p1[1]} ${cpX},${p2[1]} ${p2[0]},${p2[1]}`;
      }
      return d;
    };

    const currentCoords = influxForecastRows.map((row, index) => getPoint(row.current, index));
    const forecastCoords = influxForecastRows.map((row, index) => getPoint(row.forecast, index));

    const currentPath = createSmoothPath(currentCoords);
    const forecastPath = createSmoothPath(forecastCoords);

    const areaPath =
      currentCoords.length > 0
        ? `${currentPath} L ${currentCoords[currentCoords.length - 1][0]},${height - 18} L ${currentCoords[0][0]},${height - 18} Z`
        : '';

    const currentPeak = Math.max(...influxForecastRows.map((r) => r.current));
    const forecastPeak = Math.max(...influxForecastRows.map((r) => r.forecast));

    return {
      width,
      height,
      min,
      max,
      currentCoords,
      forecastCoords,
      currentPath,
      forecastPath,
      areaPath,
      currentPeak,
      forecastPeak,
    };
  }, []);

  // 3. Gate wait metrics
  const sortedGateWaits = useMemo(() => {
    return [...gateWaitRows].sort((a, b) => b.wait - a.wait);
  }, []);

  // 4. Terminal Queue Summary
  const queueSummary = useMemo(() => {
    const totalPressure = queueRows.reduce((acc, row) => acc + row.total, 0);
    const busiestTerminal = [...queueRows].sort((a, b) => b.total - a.total)[0];
    return {
      totalPressure,
      busiestTerminal,
      rows: queueRows,
    };
  }, []);

  // 5. RFC-4180 CSV export with UTF-8 BOM
  const exportFlights = useCallback(
    (type: 'departures' | 'arrivals' = 'departures') => {
      soundEffects.playClick();
      const isAr = language === 'ar';
      const targetFlights: FlightRow[] = type === 'departures' ? filteredDepartures : filteredArrivals;

      const headers = isAr
        ? ['رقم الرحلة', 'المدينة / الوجهة', 'الوقت المحدد', 'البوابة', 'الحالة التشغيلية']
        : ['Flight Number', 'Destination / City', 'Scheduled Time', 'Gate', 'Status'];

      const rows = targetFlights.map((f) => [f.flight, f.city, f.time, f.gate, f.status]);

      exportToCsv({
        filename: `CAI-${type.toUpperCase()}-${new Date().toISOString().slice(0, 10)}.csv`,
        headers,
        rows,
        language,
        successMessage: {
          en: `Exported ${targetFlights.length} ${type} to CSV.`,
          ar: `تم تصدير ${targetFlights.length} رحلة من جدول ${type === 'departures' ? 'المغادرة' : 'الوصول'}.`,
        },
      });
    },
    [filteredDepartures, filteredArrivals, language]
  );

  return {
    departuresSearch,
    setDeparturesSearch,
    arrivalsSearch,
    setArrivalsSearch,
    filteredDepartures,
    filteredArrivals,
    forecastGeometry,
    sortedGateWaits,
    queueSummary,
    exportFlights,
  };
}
