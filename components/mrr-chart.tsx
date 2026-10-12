import type { Movement } from "@/lib/mrr-movements";

/**
 * Recurring revenue at the end of each month, one bar a month (lib/mrr-movements.ts).
 * One series in the brand's violet, the grid recessive, the latest bar
 * labeled; each month answers on hover with its end and what moved it. The
 * table under it carries every number, so the chart is never the only way in.
 */
export function MrrChart({ months, money }: { months: Movement[]; money: (cents: number) => string }) {
  if (!months.length) return null;
  const W = 640;
  const H = 200;
  const top = 18;
  const bottom = 26;
  const left = 4;
  const plot = H - top - bottom;
  const max = Math.max(...months.map((m) => m.end), 1);
  const step = (W - left * 2) / months.length;
  const bar = Math.min(28, step * 0.56);
  const short = (month: string) => {
    const [y, m] = month.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  };
  const roundTop = (x: number, y: number, w: number, h: number) => {
    const r = Math.min(4, w / 2, h);
    return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
  };
  return (
    <figure className="mt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Monthly recurring revenue at the end of each month">
        {[0.5, 1].map((f) => (
          <line key={f} x1={0} x2={W} y1={top + plot * (1 - f)} y2={top + plot * (1 - f)} className="stroke-line" strokeWidth={1} />
        ))}
        <line x1={0} x2={W} y1={top + plot} y2={top + plot} className="stroke-line-strong" strokeWidth={1} />
        {months.map((m, i) => {
          const h = m.end > 0 ? Math.max(2, (m.end / max) * plot) : 0;
          const x = left + i * step + (step - bar) / 2;
          const last = i === months.length - 1;
          const moved = [
            m.new ? `new ${money(m.new)}` : "",
            m.reactivated ? `reactivated ${money(m.reactivated)}` : "",
            m.expansion ? `expansion ${money(m.expansion)}` : "",
            m.contraction ? `contraction −${money(m.contraction)}` : "",
            m.canceled ? `canceled −${money(m.canceled)}` : "",
          ].filter(Boolean);
          return (
            <g key={m.month}>
              {h ? <path d={roundTop(x, top + plot - h, bar, h)} className="fill-violet-brand" /> : null}
              {last && h ? (
                <text x={x + bar / 2} y={top + plot - h - 6} textAnchor="middle" className="fill-ink text-[9px] font-semibold">
                  {money(m.end)}
                </text>
              ) : null}
              <text x={x + bar / 2} y={H - 8} textAnchor="middle" className="fill-ink-mute text-[9px]">
                {short(m.month)}
              </text>
              {/* The hover target: the whole column, bigger than the bar. */}
              <rect x={left + i * step} y={0} width={step} height={H} fill="transparent">
                <title>{`${short(m.month)}: ${money(m.end)} a month${moved.length ? ` (${moved.join(", ")})` : ""}`}</title>
              </rect>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
