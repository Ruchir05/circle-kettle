"use client";

import { useEffect, useRef, type PointerEvent } from "react";

type PieceState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type DragState = {
  id: string;
  pointerId: number;
  lastClientX: number;
  lastClientY: number;
  lastTs: number;
};

const VIEWBOX_WIDTH = 220;
const VIEWBOX_HEIGHT = 300;
const DRAGGABLE_IDS = [
  "leaf-a",
  "leaf-b",
  "leaf-c",
  "flower-a",
  "flower-b",
  "cherry-1",
  "cherry-2",
  "cherry-3",
] as const;
const PIECE_ANCHORS: Record<(typeof DRAGGABLE_IDS)[number], { x: number; y: number }> = {
  "leaf-a": { x: 120, y: 150 },
  "leaf-b": { x: 136, y: 104 },
  "leaf-c": { x: 96, y: 188 },
  "flower-a": { x: 168, y: 88 },
  "flower-b": { x: 142, y: 132 },
  "cherry-1": { x: 122, y: 208 },
  "cherry-2": { x: 108, y: 222 },
  "cherry-3": { x: 138, y: 222 },
};
const PIECE_RADIUS_PX: Record<(typeof DRAGGABLE_IDS)[number], number> = {
  "leaf-a": 34,
  "leaf-b": 34,
  "leaf-c": 34,
  "flower-a": 28,
  "flower-b": 26,
  "cherry-1": 30,
  "cherry-2": 28,
  "cherry-3": 28,
};

/**
 * Decorative inline SVG — coffee branch with leaves, blossoms, and cherries.
 * Wrapped in `.coffee-plant-motion` for a slow CSS drift (see globals.css).
 */
export function CoffeePlantGraphic() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const rafRef = useRef<number | null>(null);
  const pieceRefs = useRef<Record<string, SVGGElement | null>>({});
  const boundaryRectRef = useRef<DOMRect | null>(null);
  const pieceStateRef = useRef<Record<string, PieceState>>(
    Object.fromEntries(
      DRAGGABLE_IDS.map((id) => [
        id,
        {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
        },
      ]),
    ),
  );

  const toSvgUnits = (dxClient: number, dyClient: number) => {
    const svg = svgRef.current;
    if (!svg) return { dx: 0, dy: 0 };
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return { dx: 0, dy: 0 };
    return {
      dx: dxClient * (VIEWBOX_WIDTH / rect.width),
      dy: dyClient * (VIEWBOX_HEIGHT / rect.height),
    };
  };

  const updatePieceTransform = (id: string) => {
    const node = pieceRefs.current[id];
    const state = pieceStateRef.current[id];
    if (!node || !state) return;
    node.setAttribute("transform", `translate(${state.x} ${state.y})`);
  };

  const svgPointToClient = (x: number, y: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: -1e9, y: -1e9 };
    const rect = svg.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: -1e9, y: -1e9 };
    return {
      x: rect.left + (x / VIEWBOX_WIDTH) * rect.width,
      y: rect.top + (y / VIEWBOX_HEIGHT) * rect.height,
    };
  };

  const refreshBoundaryRect = () => {
    const svg = svgRef.current;
    if (!svg) {
      boundaryRectRef.current = null;
      return;
    }
    const boundary = svg.closest(".hero-interactive-boundary");
    if (boundary instanceof HTMLElement) {
      boundaryRectRef.current = boundary.getBoundingClientRect();
      return;
    }
    boundaryRectRef.current = svg.getBoundingClientRect();
  };

  const pickPieceAtClientPoint = (clientX: number, clientY: number) => {
    let bestId: (typeof DRAGGABLE_IDS)[number] | null = null;
    let bestDistSq = Number.POSITIVE_INFINITY;
    for (const id of DRAGGABLE_IDS) {
      const anchor = PIECE_ANCHORS[id];
      const state = pieceStateRef.current[id];
      const center = svgPointToClient(anchor.x + state.x, anchor.y + state.y);
      const dx = center.x - clientX;
      const dy = center.y - clientY;
      const distSq = dx * dx + dy * dy;
      const radius = PIECE_RADIUS_PX[id] + 20;
      if (distSq <= radius * radius && distSq < bestDistSq) {
        bestDistSq = distSq;
        bestId = id;
      }
    }
    return bestId;
  };

  const beginDragFromClient = (
    id: string,
    pointerId: number,
    clientX: number,
    clientY: number,
    timeStamp: number,
  ) => {
    dragRef.current = {
      id,
      pointerId,
      lastClientX: clientX,
      lastClientY: clientY,
      lastTs: timeStamp,
    };
  };

  const moveDragByClient = (
    id: string,
    pointerId: number,
    clientX: number,
    clientY: number,
    timeStamp: number,
  ) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== id || drag.pointerId !== pointerId) return;

    const dt = Math.max(1, timeStamp - drag.lastTs);
    const { dx, dy } = toSvgUnits(clientX - drag.lastClientX, clientY - drag.lastClientY);
    const state = pieceStateRef.current[id];
    state.x += dx;
    state.y += dy;
    state.vx = (dx / dt) * 16;
    state.vy = (dy / dt) * 16;

    drag.lastClientX = clientX;
    drag.lastClientY = clientY;
    drag.lastTs = timeStamp;
    updatePieceTransform(id);
  };

  const stopDrag = (id: string, pointerId: number) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== id || drag.pointerId !== pointerId) return;
    dragRef.current = null;
  };

  const startDrag = (id: string, event: PointerEvent<SVGGElement>) => {
    event.preventDefault();
    beginDragFromClient(id, event.pointerId, event.clientX, event.clientY, event.timeStamp);
  };

  const moveDrag = (id: string, event: PointerEvent<SVGGElement>) => {
    moveDragByClient(id, event.pointerId, event.clientX, event.clientY, event.timeStamp);
  };

  const endDrag = (id: string, event: PointerEvent<SVGGElement>) => {
    stopDrag(id, event.pointerId);
  };

  useEffect(() => {
    refreshBoundaryRect();
    const onWindowChange = () => refreshBoundaryRect();
    window.addEventListener("resize", onWindowChange);
    window.addEventListener("scroll", onWindowChange, { passive: true });

    const tick = () => {
      refreshBoundaryRect();
      const activeDrag = dragRef.current;
      for (const id of DRAGGABLE_IDS) {
        if (activeDrag?.id === id) continue;
        const state = pieceStateRef.current[id];
        state.x += state.vx;
        state.y += state.vy;
        state.vx *= 0.94;
        state.vy *= 0.94;

        const anchor = PIECE_ANCHORS[id];
        const center = svgPointToClient(anchor.x + state.x, anchor.y + state.y);
        const radiusPx = PIECE_RADIUS_PX[id];
        const svg = svgRef.current;
        const bounds = boundaryRectRef.current;
        if (svg && bounds) {
          const rect = svg.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const minX = bounds.left + radiusPx;
            const maxX = bounds.right - radiusPx;
            const minY = bounds.top + radiusPx;
            const maxY = bounds.bottom - radiusPx;
            if (center.x < minX) {
              const overflow = minX - center.x;
              state.x += overflow * (VIEWBOX_WIDTH / rect.width);
              state.vx = Math.abs(state.vx) * 0.72;
            } else if (center.x > maxX) {
              const overflow = center.x - maxX;
              state.x -= overflow * (VIEWBOX_WIDTH / rect.width);
              state.vx = -Math.abs(state.vx) * 0.72;
            }
            if (center.y < minY) {
              const overflow = minY - center.y;
              state.y += overflow * (VIEWBOX_HEIGHT / rect.height);
              state.vy = Math.abs(state.vy) * 0.72;
            } else if (center.y > maxY) {
              const overflow = center.y - maxY;
              state.y -= overflow * (VIEWBOX_HEIGHT / rect.height);
              state.vy = -Math.abs(state.vy) * 0.72;
            }
          }
        }
        if (Math.abs(state.vx) < 0.02) state.vx = 0;
        if (Math.abs(state.vy) < 0.02) state.vy = 0;
        updatePieceTransform(id);
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("resize", onWindowChange);
      window.removeEventListener("scroll", onWindowChange);
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (event.button !== 0) return;
      if (dragRef.current) return;
      const bounds = boundaryRectRef.current;
      if (
        !bounds ||
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        return;
      }
      const id = pickPieceAtClientPoint(event.clientX, event.clientY);
      if (!id) return;
      beginDragFromClient(id, event.pointerId, event.clientX, event.clientY, event.timeStamp);
      event.preventDefault();
    };
    const onPointerMove = (event: globalThis.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      moveDragByClient(
        drag.id,
        event.pointerId,
        event.clientX,
        event.clientY,
        event.timeStamp,
      );
      event.preventDefault();
    };
    const onPointerUp = (event: globalThis.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      stopDrag(drag.id, event.pointerId);
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: false, capture: true });
    window.addEventListener("pointermove", onPointerMove, { passive: false, capture: true });
    window.addEventListener("pointerup", onPointerUp, { capture: true });
    window.addEventListener("pointercancel", onPointerUp, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
    // Global listeners intentionally attach once and read latest refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 220 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="coffee-plant-graphic-svg h-auto w-full max-w-none max-md:h-[min(56dvh,30rem)] max-md:w-auto max-md:max-w-[min(88vw,22rem)] md:h-auto md:w-full md:max-w-none"
      style={{ overflow: "visible" }}
      aria-hidden
    >
      <path
        d="M108 280c-4-48 8-92 24-128 18-42 44-72 62-98"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M118 268c12-36 38-62 58-84"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Leaves */}
      <g
        ref={(node) => {
          pieceRefs.current["leaf-a"] = node;
        }}
        className="cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => startDrag("leaf-a", e)}
        onPointerMove={(e) => moveDrag("leaf-a", e)}
        onPointerUp={(e) => endDrag("leaf-a", e)}
        onPointerCancel={(e) => endDrag("leaf-a", e)}
      >
        <path
          d="M132 175c-18-8-32-28-28-52 24 8 40 32 28 52z"
          fill="currentColor"
          opacity="0.35"
        />
      </g>
      <g
        ref={(node) => {
          pieceRefs.current["leaf-b"] = node;
        }}
        className="cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => startDrag("leaf-b", e)}
        onPointerMove={(e) => moveDrag("leaf-b", e)}
        onPointerUp={(e) => endDrag("leaf-b", e)}
        onPointerCancel={(e) => endDrag("leaf-b", e)}
      >
        <path
          d="M154 120c-22 4-38-14-42-38 26-2 46 14 42 38z"
          fill="currentColor"
          opacity="0.28"
        />
      </g>
      <g
        ref={(node) => {
          pieceRefs.current["leaf-c"] = node;
        }}
        className="cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => startDrag("leaf-c", e)}
        onPointerMove={(e) => moveDrag("leaf-c", e)}
        onPointerUp={(e) => endDrag("leaf-c", e)}
        onPointerCancel={(e) => endDrag("leaf-c", e)}
      >
        <path
          d="M98 200c20-6 28-32 18-52-16 14-24 36-18 52z"
          fill="currentColor"
          opacity="0.3"
        />
      </g>
      {/* White coffee flowers */}
      <g
        ref={(node) => {
          pieceRefs.current["flower-a"] = node;
        }}
        className="cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => startDrag("flower-a", e)}
        onPointerMove={(e) => moveDrag("flower-a", e)}
        onPointerUp={(e) => endDrag("flower-a", e)}
        onPointerCancel={(e) => endDrag("flower-a", e)}
      >
        <g opacity="0.9">
          <circle cx="168" cy="88" r="5" fill="currentColor" />
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="168"
              cy="88"
              rx="10"
              ry="4"
              fill="currentColor"
              opacity="0.55"
              transform={`rotate(${deg} 168 88)`}
            />
          ))}
        </g>
      </g>
      <g
        ref={(node) => {
          pieceRefs.current["flower-b"] = node;
        }}
        className="cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => startDrag("flower-b", e)}
        onPointerMove={(e) => moveDrag("flower-b", e)}
        onPointerUp={(e) => endDrag("flower-b", e)}
        onPointerCancel={(e) => endDrag("flower-b", e)}
      >
        <g opacity="0.75">
          <circle cx="142" cy="132" r="4" fill="currentColor" />
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="142"
              cy="132"
              rx="8"
              ry="3.2"
              fill="currentColor"
              opacity="0.5"
              transform={`rotate(${deg} 142 132)`}
            />
          ))}
        </g>
      </g>
      {/* Cherries (draggable individually) */}
      <g
        ref={(node) => {
          pieceRefs.current["cherry-1"] = node;
        }}
        className="cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => startDrag("cherry-1", e)}
        onPointerMove={(e) => moveDrag("cherry-1", e)}
        onPointerUp={(e) => endDrag("cherry-1", e)}
        onPointerCancel={(e) => endDrag("cherry-1", e)}
      >
        <ellipse cx="122" cy="208" rx="14" ry="18" fill="currentColor" opacity="0.5" />
        <path
          d="M122 190v22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>
      <g
        ref={(node) => {
          pieceRefs.current["cherry-2"] = node;
        }}
        className="cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => startDrag("cherry-2", e)}
        onPointerMove={(e) => moveDrag("cherry-2", e)}
        onPointerUp={(e) => endDrag("cherry-2", e)}
        onPointerCancel={(e) => endDrag("cherry-2", e)}
      >
        <ellipse cx="108" cy="222" rx="12" ry="15" fill="currentColor" opacity="0.42" />
        <path
          d="M108 207v15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>
      <g
        ref={(node) => {
          pieceRefs.current["cherry-3"] = node;
        }}
        className="cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => startDrag("cherry-3", e)}
        onPointerMove={(e) => moveDrag("cherry-3", e)}
        onPointerUp={(e) => endDrag("cherry-3", e)}
        onPointerCancel={(e) => endDrag("cherry-3", e)}
      >
        <ellipse cx="138" cy="222" rx="11" ry="14" fill="currentColor" opacity="0.38" />
        <path
          d="M138 208v14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>
    </svg>
  );
}
