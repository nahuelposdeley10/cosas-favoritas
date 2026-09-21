import type { CSSProperties } from "react";

const HEART = "#C2597F";
const FLOWER = "#D47A9E";
const PALETTE = ["#D47A9E", "#E7A8BE", "#F2C9D7", "#C2597F", "#2C6E63"];

type Particle = {
  left: number;
  top?: number;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  opacity: number;
  blur?: number;
};

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260921);

function makeFalling(count: number, sizeA: number, sizeB: number): Particle[] {
  return Array.from({ length: count }, () => {
    const duration = 15 + rand() * 18;
    return {
      left: 2 + rand() * 96,
      size: sizeA + rand() * (sizeB - sizeA),
      duration,
      delay: -rand() * duration,
      sway: rand() * 120 - 60,
      opacity: 0.35 + rand() * 0.5,
      blur: rand() < 0.45 ? rand() * 1.4 : 0,
    };
  });
}

function makeAmbient(count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const duration = 7 + rand() * 9;
    return {
      left: 2 + rand() * 96,
      top: 3 + rand() * 88,
      size: 16 + rand() * 26,
      duration,
      delay: -rand() * duration,
      sway: rand() * 60 - 30,
      opacity: 0.4 + rand() * 0.4,
      blur: rand() < 0.5 ? rand() * 1.2 : 0,
    };
  });
}

function makeHearts(count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const duration = 16 + rand() * 20;
    return {
      left: 3 + rand() * 94,
      size: 14 + rand() * 22,
      duration,
      delay: -rand() * duration,
      sway: rand() * 90 - 45,
      opacity: 0.45 + rand() * 0.4,
    };
  });
}

function makeFlowers(count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const duration = 40 + rand() * 30;
    return {
      left: 4 + rand() * 92,
      size: 64 + rand() * 48,
      duration,
      delay: -rand() * duration,
      sway: rand() * 60 - 30,
      opacity: 0.22 + rand() * 0.14,
      blur: 1 + rand() * 1.6,
    };
  });
}

const petals = makeFalling(36, 18, 46);
const ambient = makeAmbient(26);
const hearts = makeHearts(14);
const flowers = makeFlowers(6);

function FloatingRomance() {
  return (
    <div
      aria-hidden="true"
      className="floating-layer pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {flowers.map((f, i) => (
        <FloatPiece key={`f-${i}`} particle={f} color={FLOWER} falling>
          <FlowerIcon />
        </FloatPiece>
      ))}
      {hearts.map((h, i) => (
        <FloatPiece key={`h-${i}`} particle={h} color={HEART} falling>
          <HeartIcon />
        </FloatPiece>
      ))}
      {petals.map((p, i) => (
        <FloatPiece
          key={`p-${i}`}
          particle={p}
          color={PALETTE[i % PALETTE.length]}
          falling
        >
          <PetalIcon />
        </FloatPiece>
      ))}
      {ambient.map((a, i) => (
        <FloatPiece
          key={`a-${i}`}
          particle={a}
          color={PALETTE[(i * 2 + 1) % PALETTE.length]}
        >
          <PetalIcon />
        </FloatPiece>
      ))}
    </div>
  );
}

function FloatPiece({
  particle,
  color,
  falling = false,
  children,
}: {
  particle: Particle;
  color: string;
  falling?: boolean;
  children: React.ReactNode;
}) {
  const style = {
    left: `${particle.left}%`,
    top: particle.top ? `${particle.top}%` : undefined,
    width: particle.size,
    height: particle.size,
    animation: falling
      ? `fall-down ${particle.duration}s linear ${particle.delay}s infinite`
      : `drift ${particle.duration}s ease-in-out ${particle.delay}s infinite alternate`,
    "--sway": `${particle.sway}px`,
    "--fl-opacity": String(particle.opacity),
    filter: particle.blur ? `blur(${particle.blur}px)` : undefined,
  } as CSSProperties;

  return (
    <span className="absolute block will-change-transform" style={style}>
      <span className="block h-full w-full" style={{ color }}>
        {children}
      </span>
    </span>
  );
}

function PetalIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full">
      <path d="M24 4 C36 12 42 26 24 44 C6 26 12 12 24 4 Z" fill="currentColor" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full">
      <path
        d="M24 42 C12 34 5 22 9 14 C13 7 19 8 24 15 C29 8 35 7 39 14 C43 22 36 34 24 42 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FlowerIcon() {
  const angles = [0, 60, 120, 180, 240, 300];
  return (
    <svg viewBox="0 0 48 48" className="h-full w-full">
      {angles.map((a) => (
        <ellipse
          key={a}
          cx="24"
          cy="23"
          rx="6.5"
          ry="11"
          fill="currentColor"
          transform={`rotate(${a} 24 24)`}
        />
      ))}
      <circle cx="24" cy="24" r="5" fill="#E9A85C" />
    </svg>
  );
}

export default FloatingRomance;