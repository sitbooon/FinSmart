import React, { useState } from 'react';
import { DayForecast } from '../types';

interface CashflowChartProps {
  forecast: DayForecast[];
  comparisonForecast?: DayForecast[];
  comparisonLabel?: string;
}

export const CashflowChart: React.FC<CashflowChartProps> = ({
  forecast,
  comparisonForecast,
  comparisonLabel = 'תרחיש סימולציה',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!forecast || forecast.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        אין מספיק נתוני תזרים להצגת תחזית
      </div>
    );
  }

  // Calculate scales
  const allBalances = [
    ...forecast.map((f) => f.projectedBalance),
    ...(comparisonForecast ? comparisonForecast.map((f) => f.projectedBalance) : []),
    0, // Always include 0 line
  ];

  const minVal = Math.min(...allBalances);
  const maxVal = Math.max(...allBalances);
  const range = maxVal - minVal || 1;

  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 45;

  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingTop - paddingBottom;

  const getY = (val: number) => {
    return paddingTop + plotHeight - ((val - minVal) / range) * plotHeight;
  };

  const getX = (idx: number, total: number) => {
    // In RTL, day 1 starts on the right, but standard charts can render Day 1 -> Day 30 logically
    // To make it intuitive, we render timeline from left to right (today -> end of month)
    return paddingX + (idx / (total - 1 || 1)) * plotWidth;
  };

  const zeroY = getY(0);

  // Generate SVG path for baseline
  const pathD = forecast
    .map((point, idx) => {
      const x = getX(idx, forecast.length);
      const y = getY(point.projectedBalance);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Gradient area
  const areaD = `${pathD} L ${getX(forecast.length - 1, forecast.length)} ${getY(minVal)} L ${getX(
    0,
    forecast.length
  )} ${getY(minVal)} Z`;

  // Comparison path if any
  let compPathD = '';
  if (comparisonForecast && comparisonForecast.length > 0) {
    compPathD = comparisonForecast
      .map((point, idx) => {
        const x = getX(idx, comparisonForecast.length);
        const y = getY(point.projectedBalance);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }

  const activePoint = hoveredIndex !== null ? forecast[hoveredIndex] : null;
  const activeCompPoint =
    hoveredIndex !== null && comparisonForecast ? comparisonForecast[hoveredIndex] : null;

  return (
    <div className="w-full relative select-none">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
            <span className="w-3 h-0.5 bg-[#00B894] rounded-full inline-block"></span>
            <span>תחזית יתרה שוטפת (בפועל + צפי)</span>
          </div>
          {comparisonForecast && (
            <div className="flex items-center gap-1.5 font-medium text-amber-500">
              <span className="w-3 h-0.5 bg-amber-500 border-dashed border-t-2 border-amber-500 inline-block"></span>
              <span>{comparisonLabel}</span>
            </div>
          )}
        </div>
        <div className="text-gray-400">
          {forecast.length} ימים עד סוף החודש
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-0 overflow-visible"
        >
          <defs>
            <linearGradient id="cashflowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00B894" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00B894" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((pct, i) => {
            const y = paddingTop + plotHeight * pct;
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Zero balance line */}
          {zeroY >= paddingTop && zeroY <= paddingTop + plotHeight && (
            <g>
              <line
                x1={paddingX}
                y1={zeroY}
                x2={width - paddingX}
                y2={zeroY}
                stroke="#FF7675"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                opacity="0.85"
              />
              <text
                x={width - paddingX + 5}
                y={zeroY + 3}
                fill="#FF7675"
                fontSize="10"
                textAnchor="start"
                className="font-mono font-semibold"
              >
                0 ₪
              </text>
            </g>
          )}

          {/* Area fill */}
          <path d={areaD} fill="url(#cashflowGrad)" />

          {/* Baseline Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#00B894"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Comparison Line if present */}
          {compPathD && (
            <path
              d={compPathD}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {forecast.map((pt, idx) => {
            const cx = getX(idx, forecast.length);
            const cy = getY(pt.projectedBalance);
            const isHovered = hoveredIndex === idx;
            const hasMajorEvents = pt.events.length > 0;

            return (
              <g key={idx} className="cursor-pointer">
                {/* Hit area for mouse interaction */}
                <rect
                  x={cx - 14}
                  y={paddingTop}
                  width="28"
                  height={plotHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Event pulse or indicator */}
                {hasMajorEvents && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="6"
                    className="fill-amber-400 animate-pulse opacity-60"
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : hasMajorEvents ? 4.5 : 3}
                  className={`${
                    isHovered
                      ? 'fill-white stroke-emerald-600 stroke-[3px]'
                      : hasMajorEvents
                      ? 'fill-amber-500 stroke-white stroke-[2px]'
                      : 'fill-emerald-500'
                  } transition-all duration-150`}
                />

                {/* X axis labels for selected intervals */}
                {(idx % Math.ceil(forecast.length / 7) === 0 || idx === forecast.length - 1) && (
                  <text
                    x={cx}
                    y={height - 15}
                    textAnchor="middle"
                    className="text-[11px] fill-slate-400 font-medium select-none"
                  >
                    {pt.dateStr}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Tooltip */}
      {activePoint && hoveredIndex !== null && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-3 rounded-xl shadow-xl backdrop-blur-md text-xs border border-slate-700 min-w-[190px] max-w-[280px] transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${Math.min(80, Math.max(20, (getX(hoveredIndex, forecast.length) / width) * 100)).toFixed(1)}%`,
            top: `${Math.max(10, getY(activePoint.projectedBalance) - 20)}px`,
          }}
        >
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800 mb-1.5 font-semibold">
            <span>יום {activePoint.dateStr}</span>
            <span
              className={`font-mono text-sm ${
                activePoint.projectedBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ₪{activePoint.projectedBalance.toLocaleString()}
            </span>
          </div>

          {activeCompPoint && (
            <div className="flex justify-between text-amber-400 mb-1">
              <span>{comparisonLabel}:</span>
              <span className="font-mono">₪{activeCompPoint.projectedBalance.toLocaleString()}</span>
            </div>
          )}

          {activePoint.events.length > 0 ? (
            <div className="space-y-1 mt-1">
              <div className="text-[10px] text-slate-400 font-medium">אירועים ביום זה:</div>
              {activePoint.events.map((ev, i) => (
                <div key={i} className="flex justify-between text-[11px]">
                  <span className="truncate max-w-[130px]">{ev.name}</span>
                  <span
                    className={`font-mono ${
                      ev.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {ev.type === 'income' ? '+' : '-'}₪{ev.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-slate-400">הוצאה שוטפת משוערת רגילה</div>
          )}
        </div>
      )}
    </div>
  );
};
