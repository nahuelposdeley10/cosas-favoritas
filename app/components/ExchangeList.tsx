"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";

type Side = "hers" | "his";
type Item = { id: string; label: string; note?: string; image?: string };
type SideData = { items: Item[]; done: string[] };
type Accent = {
  key: string;
  title: string;
  chip: string;
  page: string;
  check: string;
  hover: string;
  focus: string;
  button: string;
};

const STORAGE_KEY = "cosas-favoritas-v4";

const seeds: Record<Side, Item[]> = {
  hers: [
    { id: "h1", label: "torta helada", image: "/fotos/torta-helada.jpg" },
    { id: "h2", label: "set de mate", image: "/fotos/set-de-mate.jpg" },
    { id: "h3", label: "ramo de maquillaje", image: "/fotos/ramo-de-maquillaje.jpg" },
    { id: "h4", label: "pulseras", image: "/fotos/pulseras.jpg" },
    { id: "h5", label: "flores", image: "/fotos/flores.jpg" },
    { id: "h6", label: "fibrones acrílicos", image: "/fotos/fibrones-de-acrilicos.webp" },
    { id: "h7", label: "conjunto", image: "/fotos/conjunto.jpg" },
    { id: "h8", label: "anillos", image: "/fotos/anillos.jpg" },
  ],
  his: [
    { id: "n1", label: "remera de la NFL", image: "/fotos/remera-nfl.webp" },
    { id: "n2", label: "remera de Neymar", image: "/fotos/remera-neymar.webp" },
    { id: "n3", label: "mouse inalámbrico", image: "/fotos/mouse-inalambrico.jpg" },
    { id: "n4", label: "medias Nike 3/4", image: "/fotos/medias-nike-tres-cuartos.webp" },
    { id: "n5", label: "botines", image: "/fotos/botines.jpg" },
    { id: "n6", label: "barra de sonido", image: "/fotos/barra-de-sonido-pc.png" },
  ],
};

const defaults: Record<Side, SideData> = {
  hers: { items: seeds.hers, done: [] },
  his: { items: seeds.his, done: [] },
};

const accents: Record<Side, Accent> = {
  hers: {
    key: "hers",
    title: "text-rose",
    chip: "bg-rose-soft text-rose",
    page: "bg-rose-soft/50",
    check: "bg-rose border-rose",
    hover: "group-hover:border-rose",
    focus: "focus-visible:outline-rose/70",
    button: "bg-rose",
  },
  his: {
    key: "his",
    title: "text-teal",
    chip: "bg-teal-soft text-teal",
    page: "bg-teal-soft/50",
    check: "bg-teal border-teal",
    hover: "group-hover:border-teal",
    focus: "focus-visible:outline-teal/70",
    button: "bg-teal",
  },
};

function loadInitial(): Record<Side, SideData> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<Side, SideData>;
      if (parsed.hers?.items?.length && parsed.his?.items?.length) {
        return parsed;
      }
    }
  } catch {
    /* noop */
  }
  return defaults;
}

function fileToDataUrl(file: File, maxDim = 1000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas no disponible"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ExchangeList() {
  const [lists, setLists] = useState<Record<Side, SideData>>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    } catch {
      /* noop */
    }
  }, [lists]);

  function toggle(side: Side, id: string) {
    setLists((prev) => {
      const data = prev[side];
      const done = data.done.includes(id)
        ? data.done.filter((d) => d !== id)
        : [...data.done, id];
      return { ...prev, [side]: { ...data, done } };
    });
  }

  function addItem(side: Side, label: string, image?: string) {
    const clean = label.trim();
    if (!clean && !image) return;
    const item: Item = { id: crypto.randomUUID(), label: clean, image };
    setLists((prev) => ({
      ...prev,
      [side]: { ...prev[side], items: [...prev[side].items, item] },
    }));
  }

  function updateItem(side: Side, id: string, patch: Partial<Item>) {
    setLists((prev) => ({
      ...prev,
      [side]: {
        ...prev[side],
        items: prev[side].items.map((it) =>
          it.id === id ? { ...it, ...patch } : it
        ),
      },
    }));
  }

  function removeItem(side: Side, id: string) {
    setLists((prev) => ({
      ...prev,
      [side]: {
        items: prev[side].items.filter((it) => it.id !== id),
        done: prev[side].done.filter((d) => d !== id),
      },
    }));
  }

  const [lightbox, setLightbox] = useState<{
    item: Item;
    side: Side;
  } | null>(null);
  const [burst, setBurst] = useState<{
    id: number;
    x: number;
    y: number;
  } | null>(null);

  function openLightbox(item: Item, side: Side, x?: number, y?: number) {
    setLightbox({ item, side });
    setBurst({
      id: Date.now() + Math.random(),
      x: x ?? window.innerWidth / 2,
      y: y ?? window.innerHeight / 2,
    });
    window.setTimeout(() => setBurst(null), 1300);
  }

  const hersDone = lists.hers.done.length;
  const hisDone = lists.his.done.length;

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-rose/20 bg-card shadow-[0_45px_100px_-40px_rgba(146,64,94,0.5)]">
      <header className="grid grid-cols-1 items-center gap-5 px-6 py-7 sm:px-10 md:grid-cols-[1fr_auto_1fr] md:gap-6">
        <div className="flex flex-col items-start gap-2">
          <p className="font-hand text-4xl leading-none text-rose">para Oriana</p>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted">se encarga Nahuel</p>
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-rose bg-rose-soft">
              {hersDone} de {lists.hers.items.length}
            </span>
          </div>
        </div>

        <div className="order-first flex justify-center md:order-none">
          <span
            aria-hidden="true"
            className="grid h-14 w-14 place-items-center rounded-full bg-ink font-display text-2xl italic text-paper shadow-lg ring-8 ring-card md:h-16 md:w-16"
          >
            &amp;
          </span>
        </div>

        <div className="flex flex-col items-start gap-2 md:items-end">
          <p className="font-hand text-4xl leading-none text-teal">para Nahuel</p>
          <div className="flex items-center gap-2 md:flex-row-reverse">
            <p className="text-sm text-muted">se encarga Oriana</p>
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-teal bg-teal-soft">
              {hisDone} de {lists.his.items.length}
            </span>
          </div>
        </div>
      </header>

      <div
        aria-hidden="true"
        className="mx-auto hidden h-px w-5/6 bg-seam/70 md:block"
      />

      <main className="relative grid divide-y divide-seam/60 md:grid-cols-2 md:divide-y-0">
        <div
          aria-hidden="true"
          className="absolute inset-y-8 left-1/2 hidden w-px -translate-x-1/2 bg-seam/70 md:block"
        />
        <Column
          data={lists.hers}
          accent={accents.hers}
          onToggle={(id) => toggle("hers", id)}
          onAdd={(label, image) => addItem("hers", label, image)}
          onUpdate={(id, patch) => updateItem("hers", id, patch)}
          onRemove={(id) => removeItem("hers", id)}
          onOpen={(item, x, y) => openLightbox(item, "hers", x, y)}
        />
        <Column
          data={lists.his}
          accent={accents.his}
          onToggle={(id) => toggle("his", id)}
          onAdd={(label, image) => addItem("his", label, image)}
          onUpdate={(id, patch) => updateItem("his", id, patch)}
          onRemove={(id) => removeItem("his", id)}
          onOpen={(item, x, y) => openLightbox(item, "his", x, y)}
        />
      </main>

      {lightbox ? (
        <Lightbox
          item={lightbox.item}
          accent={accents[lightbox.side]}
          sideLabel={
            lightbox.side === "hers" ? "para Oriana" : "para Nahuel"
          }
          onClose={() => setLightbox(null)}
        />
      ) : null}

      {burst ? <HeartBurst key={burst.id} x={burst.x} y={burst.y} /> : null}

      <footer className="border-t border-seam/60 px-6 py-4">
        <p className="text-center font-hand text-xl text-muted">
          tilde lo que ya esté · cada uno agrega lo suyo
        </p>
      </footer>
    </div>
  );
}

function Column({
  data,
  accent,
  onToggle,
  onAdd,
  onUpdate,
  onRemove,
  onOpen,
}: {
  data: SideData;
  accent: Accent;
  onToggle: (id: string) => void;
  onAdd: (label: string, image?: string) => void;
  onUpdate: (id: string, patch: Partial<Item>) => void;
  onRemove: (id: string) => void;
  onOpen: (item: Item, x?: number, y?: number) => void;
}) {
  const [draft, setDraft] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmId) return;
    const t = setTimeout(() => setConfirmId(null), 3000);
    return () => clearTimeout(t);
  }, [confirmId]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() && !preview) return;
    onAdd(draft, preview ?? undefined);
    setDraft("");
    setPreview(null);
  }

  async function handleFile(file: File) {
    try {
      setPreview(await fileToDataUrl(file));
    } catch {
      setPreview(null);
    }
  }

  return (
    <section className={`flex flex-col px-6 py-8 sm:px-10 ${accent.page}`}>
      <ul className="flex flex-col gap-1">
        {data.items.map((item) => {
          const done = data.done.includes(item.id);

          if (editingId === item.id) {
            return (
              <li key={item.id} className="pt-1">
                <Editor
                  item={item}
                  accent={accent}
                  onCancel={() => setEditingId(null)}
                  onSave={(patch) => {
                    onUpdate(item.id, patch);
                    setEditingId(null);
                  }}
                />
              </li>
            );
          }

          return (
            <li key={item.id}>
              <div className="flex items-start gap-0.5 rounded-2xl px-0.5 py-1 transition-colors hover:bg-white/70">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={done}
                  aria-label={done ? "Desmarcar" : "Marcar"}
                  onClick={() => onToggle(item.id)}
                  className={`group mt-1.5 grid h-7 w-7 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.focus}`}
                >
                  <span
                    aria-hidden="true"
                    className={`grid h-5 w-5 place-items-center rounded-[6px] border-2 transition-colors ${
                      done
                        ? accent.check
                        : `border-seam bg-card ${accent.hover}`
                    }`}
                  >
                    <svg
                      viewBox="0 0 12 10"
                      fill="none"
                      className={`h-3 w-3 transition-all duration-200 ${
                        done ? "scale-100 opacity-100" : "scale-50 opacity-0"
                      }`}
                    >
                      <path
                        d="M1.5 5.5 4.4 8.4 10.5 2"
                        stroke="#ffffff"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={(e) =>
                    onOpen(
                      item,
                      e.clientX || window.innerWidth / 2,
                      e.clientY || window.innerHeight / 2
                    )
                  }
                  disabled={!item.image}
                  aria-label={
                    item.image
                      ? `Ver en grande: ${item.label || "foto"}`
                      : undefined
                  }
                  className={`group flex flex-1 items-start gap-3 rounded-xl px-2.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.focus} ${
                    item.image ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.label || "foto"}
                      className={`h-12 w-12 shrink-0 rounded-xl border border-seam/70 object-cover transition-all duration-200 group-hover:scale-[1.03] group-hover:border-seam ${
                        done ? "opacity-50" : ""
                      }`}
                    />
                  ) : null}

                  <span className="min-w-0">
                    {item.label ? (
                      <span
                        className={`block font-medium ${
                          done
                            ? "text-muted line-through decoration-muted/60"
                            : "text-ink"
                        }`}
                      >
                        {item.label}
                      </span>
                    ) : null}
                    {item.note ? (
                      <span
                        className={`block text-xs ${
                          done ? "text-muted/70" : "text-muted"
                        }`}
                      >
                        {item.note}
                      </span>
                    ) : null}
                  </span>

                  {item.image ? (
                    <span
                      aria-hidden="true"
                      className="mt-1.5 ml-auto h-4 w-4 shrink-0 self-center text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M8 3H3v5M12 3h5v5M8 17H3v-5M12 17h5v-5" />
                      </svg>
                    </span>
                  ) : null}
                </button>

                <div className="flex items-center gap-0.5 self-start pt-2.5 pr-1.5">
                  <button
                    type="button"
                    aria-label={`Editar ${item.label || "item"}`}
                    onClick={() => {
                      setConfirmId(null);
                      setEditingId(item.id);
                    }}
                    className={`grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-white hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.focus}`}
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M4 16l.9-3.3L13.6 4a1.5 1.5 0 0 1 2.1 2.1L7 14.8 4 16Z" />
                      <path d="M12.5 5 15 7.5" />
                    </svg>
                  </button>

                  {confirmId === item.id ? (
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="rounded-full bg-rose px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose/70"
                    >
                      ¿quitar?
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Quitar ${item.label || "item"}`}
                      onClick={() => setConfirmId(item.id)}
                      className={`grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-white hover:text-rose focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.focus}`}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M4.5 6h11" />
                        <path d="M8 6V4.5h4V6" />
                        <path d="M6 6l.75 9.5a1.5 1.5 0 0 0 1.5 1.4h3.5a1.5 1.5 0 0 0 1.5-1.4L14 6" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6">
        {preview ? (
          <div className="mb-3 flex items-center gap-2">
            <img
              src={preview}
              alt=""
              className="h-10 w-10 rounded-lg border border-seam object-cover"
            />
            <p className="text-xs text-muted">foto lista para agregar</p>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="rounded-full px-2 py-0.5 text-xs text-muted underline decoration-seam underline-offset-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/40"
            >
              quitar
            </button>
          </div>
        ) : null}

        <form onSubmit={submit} className="flex items-center gap-2">
          <label htmlFor={`add-${accent.key}`} className="sr-only">
            Agregar algo a la lista
          </label>
          <input
            id={`add-${accent.key}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="agregar algo…"
            className="h-10 flex-1 rounded-full border border-seam/80 bg-card px-4 text-sm text-ink transition-colors placeholder:text-muted focus:border-seam focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            aria-label="Adjuntar foto"
            onClick={() => fileRef.current?.click()}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
              preview
                ? accent.button
                : "border border-seam/80 bg-card text-muted hover:text-ink"
            } ${accent.focus}`}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4.5 w-4.5"
            >
              <rect x="2.5" y="3.5" width="15" height="13" rx="2.5" />
              <circle cx="14.2" cy="7" r="1.5" />
              <path d="M3 14.5l4.2-4.2 2.8 2.8 2.8-2.6L17 15" />
            </svg>
          </button>
          <button
            type="submit"
            aria-label="Agregar"
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-paper transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.button}`}
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
            >
              <path d="M8 2.5v11M2.5 8h11" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}

const BURST_COLORS = [
  "#C2597F",
  "#E7A8BE",
  "#D47A9E",
  "#F2C9D7",
  "#2C6E63",
];

function HeartBurst({ x, y }: { x: number; y: number }) {
  const hearts = useMemo(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return Array.from({ length: 60 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const rad = Math.sqrt(Math.random()) * Math.max(w / 2, h / 2) * 1.15;
      return {
        id: i,
        dx: Math.cos(angle) * rad,
        dy: Math.sin(angle) * rad,
        rot: (Math.random() * 120 - 60).toFixed(1),
        size: 16 + Math.random() * 30,
        delay: Math.random() * 260,
        duration: 850 + Math.random() * 400,
        endScale: (1 + Math.random() * 0.5).toFixed(2),
        color: BURST_COLORS[i % BURST_COLORS.length],
      };
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
    >
      <span
        className="absolute inset-0"
        style={{
          animation: "screen-flash 550ms ease-out both",
          background: "#FBE3E9",
        }}
      />
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute block"
          style={
            {
              left: x,
              top: y,
              width: h.size,
              height: h.size,
              color: h.color,
              animation: `screen-burst ${h.duration}ms cubic-bezier(0.22, 0.61, 0.36, 1) ${h.delay}ms both`,
              "--dx": `${h.dx}px`,
              "--dy": `${h.dy}px`,
              "--rot": `${h.rot}deg`,
              "--end-scale": h.endScale,
            } as CSSProperties
          }
        >
          <svg viewBox="0 0 48 48" className="h-full w-full">
            <path
              d="M24 42 C12 34 5 22 9 14 C13 7 19 8 24 15 C29 8 35 7 39 14 C43 22 36 34 24 42 Z"
              fill="currentColor"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

function Lightbox({
  item,
  accent,
  sideLabel,
  onClose,
}: {
  item: Item;
  accent: Accent;
  sideLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.label || "foto"}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10"
    >
      <div
        className="absolute inset-0 animate-[fade-in_200ms_ease-out] bg-ink/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="animate-[pop-in_240ms_ease-out] relative flex w-full max-w-2xl flex-col items-center">
        <div className="relative w-full">
          <div className="overflow-hidden rounded-3xl border border-seam bg-paper shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)]">
            {item.image ? (
              <img
                src={item.image}
                alt={item.label || "foto"}
                className="max-h-[70vh] w-full object-contain"
              />
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Cerrar"
            className="absolute -top-3 -right-3 grid h-11 w-11 place-items-center rounded-full bg-ink text-paper shadow-lg ring-2 ring-card transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
            >
              <path d="M3 3l6 6M9 3l-6 6" />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <p className={`font-hand text-3xl leading-tight ${accent.title}`}>
            {item.label}
          </p>
          {item.note ? (
            <p className="text-sm text-muted">{item.note}</p>
          ) : null}
          <span
            className={`mt-1 rounded-full px-3 py-1 text-xs font-semibold ${accent.chip}`}
          >
            {sideLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function Editor({
  item,
  accent,
  onCancel,
  onSave,
}: {
  item: Item;
  accent: Accent;
  onCancel: () => void;
  onSave: (patch: { label: string; note?: string; image?: string }) => void;
}) {
  const [label, setLabel] = useState(item.label ?? "");
  const [note, setNote] = useState(item.note ?? "");
  const [image, setImage] = useState<string | undefined>(item.image);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border border-seam/80 bg-card p-3 focus-within:outline-2 focus-within:outline-offset-2 ${accent.focus}`}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <label htmlFor={`edit-${accent.key}-${item.id}`} className="sr-only">
            Nombre
          </label>
          <input
            id={`edit-${accent.key}-${item.id}`}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="nombre"
            className="h-9 w-full rounded-full border border-seam/80 bg-white/70 px-3.5 text-sm text-ink placeholder:text-muted focus:border-seam focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          />
          <label
            htmlFor={`edit-note-${accent.key}-${item.id}`}
            className="sr-only"
          >
            Nota
          </label>
          <input
            id={`edit-note-${accent.key}-${item.id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="nota (opcional)"
            className="h-9 w-full rounded-full border border-seam/80 bg-white/70 px-3.5 text-sm text-ink placeholder:text-muted focus:border-seam focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          />
        </div>

        {image ? (
          <div className="relative h-12 w-12 shrink-0">
            <img
              src={image}
              alt=""
              className="h-12 w-12 rounded-xl border border-seam/70 object-cover"
            />
            <button
              type="button"
              aria-label="Quitar foto"
              onClick={() => setImage(undefined)}
              className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-paper shadow-sm transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/50"
            >
              <svg
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-3 w-3"
              >
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              try {
                setImage(await fileToDataUrl(file));
              } catch {
                /* noop */
              }
            }
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            image
              ? "border border-seam/70 bg-white/70 text-muted hover:text-ink"
              : "bg-ink text-paper"
          } transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.focus}`}
        >
          {image ? "cambiar foto" : "agregar foto"}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3 py-1 text-xs font-medium text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/40"
          >
            cancelar
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                label: label.trim(),
                note: note.trim() || undefined,
                image,
              })
            }
            className={`rounded-full px-3.5 py-1 text-xs font-semibold text-paper transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.button}`}
          >
            guardar
          </button>
        </div>
      </div>
    </div>
  );
}