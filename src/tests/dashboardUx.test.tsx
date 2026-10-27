import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MetricCard, ProgressBar } from "../components/command-center/MetricWidgets";
import { ForecastLineChart } from "../features/operations/ForecastLineChart";
import { LocaleContext } from "../context/locale";

describe("Dashboard presentation regressions", () => {
  it.each(["2.5", "94.2%", "98%", "58,420", "−1.2%", "N/A"])("preserves the exact KPI value %s", value => {
    const html = renderToStaticMarkup(<MetricCard label="Metric" value={value} />);
    expect(html).toContain(`>${value}</span>`);
  });

  it("shows trend direction independently of whether an increase is favorable", () => {
    expect(renderToStaticMarkup(<MetricCard label="Delays" value="4" delta="+2 min" deltaTone="warn" />)).toContain("lucide-arrow-up-right");
    expect(renderToStaticMarkup(<MetricCard label="Delays" value="2" delta="-2 min" deltaTone="ok" />)).toContain("lucide-arrow-down-right");
    expect(renderToStaticMarkup(<MetricCard label="Movements" value="148" delta="On schedule" />)).not.toContain("lucide-arrow");
  });

  it.each([[150, 100, 100], [-10, 100, 0], [10, 0, 10], [NaN, 100, 0]])("keeps progress semantics valid for %s / %s", (value, max, expected) => {
    const html = renderToStaticMarkup(<ProgressBar value={value} max={max} label="Coverage" />);
    expect(html).toContain(`aria-valuenow="${expected}"`);
    expect(html).toContain('aria-valuemax="100"');
    expect(html).not.toMatch(/NaN|Infinity/);
  });

  it("offers forecast and modeled capacity values in an expandable table", () => {
    const html = renderToStaticMarkup(<ForecastLineChart data={[{time: "Now", current: 960, forecast: 980, modeledCapacity: 1100}, {time: "+1h", current: 1200, forecast: 1320, modeledCapacity: 1250}]} />);
    expect(html).toContain("View values and method");
    expect(html).toContain("Largest modeled shortfall: ");
    expect(html).toContain("1,320");
    expect(html).toContain("1,250");
    expect(html).toContain('stroke-dasharray="7 5"');
    expect(html).toContain('scope="col"');
    expect(html).toContain("from zero");
  });

  it("handles empty and single-point forecasts without invalid SVG coordinates", () => {
    expect(renderToStaticMarkup(<ForecastLineChart data={[]} />)).toContain("No forecast data available.");
    const html = renderToStaticMarkup(<ForecastLineChart data={[{time: "Now", current: 0, forecast: 0}]} />);
    expect(html).not.toMatch(/NaN|Infinity/);
    expect(html).toContain("<svg");
  });

  it("localizes chart descriptions and table controls in Arabic", () => {
    const html = renderToStaticMarkup(<LocaleContext.Provider value="ar"><ForecastLineChart data={[{time: "Now", current: 100, forecast: 200}]} /></LocaleContext.Provider>);
    expect(html).toContain("عرض القيم وطريقة الحساب");
    expect(html).toContain("الآن");
    expect(html).not.toContain("Forecast peak");
  });
});
