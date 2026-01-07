"use client";

import React from "react";

type Cell = { r: number; c: number; v: number };

export function Heatmap({
  rows = 7,
  cols = 24,
  data,
  max,
  rowLabels,
  colLabels,
  title,
}: {
  rows?: number;
  cols?: number;
  data: Cell[];
  max: number;
  rowLabels?: string[];
  colLabels?: string[];
  title?: string;
}) {
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (const { r, c, v } of data) {
    if (r >= 0 && r < rows && c >= 0 && c < cols) grid[r][c] = v;
  }
  function colorFor(v: number) {
    const ratio = Math.min(1, v / (max || 1));
    const hue = 160;
    const alpha = 0.06 + ratio * 0.72;
    return `hsl(${hue} 85% 45% / ${alpha})`;
  }

  const minTrackPx = 22;

  const header = title
    ? React.createElement(
        "div",
        { className: "text-sm font-semibold mb-2" },
        title,
      )
    : null;

  const rowHeader = rowLabels
    ? React.createElement(
        "div",
        {
          className: "mr-2 grid gap-1",
          style: { gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` },
        },
        ...rowLabels.slice(0, rows).map((l, i) =>
          React.createElement(
            "div",
            {
              key: i,
              className:
                "text-[10px] text-muted-foreground leading-none self-center flex items-center",
              style: { blockSize: `${minTrackPx}px` },
            },
            l,
          ),
        ),
      )
    : null;

  const colHeader = colLabels
    ? React.createElement(
        "div",
        {
          className: "mb-2 grid gap-1",
          style: {
            gridTemplateColumns: `repeat(${cols}, minmax(${minTrackPx}px, 1fr))`,
          },
        },
        ...colLabels.slice(0, cols).map((l, i) =>
          React.createElement(
            "div",
            {
              key: i,
              className: "text-[10px] text-muted-foreground text-center",
            },
            l,
          ),
        ),
      )
    : null;

  const gridEl = React.createElement(
    "div",
    {
      className: "grid gap-1",
      style: {
        gridTemplateColumns: `repeat(${cols}, minmax(${minTrackPx}px, 1fr))`,
      },
    },
    ...grid.flatMap((row, ri) =>
      row.map((v, ci) =>
        React.createElement("div", {
          key: `${ri}-${ci}`,
          className:
            "w-full rounded-[4px] border border-border/40 transition-transform hover:scale-[1.02]",
          style: { background: colorFor(v), blockSize: `${minTrackPx}px` },
          title: `${v}`,
        }),
      ),
    ),
  );

  return React.createElement(
    "div",
    { className: "rounded-xl border p-4 shadow-sm" },
    header,
    React.createElement(
      "div",
      { className: "flex items-start gap-2 overflow-x-auto" },
      rowHeader,
      React.createElement("div", { className: "w-full" }, colHeader, gridEl),
    ),
  );
}
