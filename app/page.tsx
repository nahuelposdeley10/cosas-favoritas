import ExchangeList from "./components/ExchangeList";
import FloatingRomance from "./components/FloatingRomance";

function Heart({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
      <FloatingRomance />

      <main className="relative w-full max-w-4xl">
        <header className="mb-8 text-center">
          <p className="flex items-center justify-center gap-2.5 font-hand text-2xl text-rose sm:text-3xl">
            <Heart className="h-4 w-4 text-rose" />
            un cuaderno a dos manos
            <Heart className="h-4 w-4 text-rose" />
          </p>
          <h1 className="mt-1 font-display text-4xl font-medium italic tracking-tight text-ink sm:text-5xl">
            nuestras cosas favoritas
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted sm:text-base">
            Las cosas lindas que nos gusta regalarnos, anotadas en una sola hoja
            para que ninguna se quede afuera.
          </p>
        </header>

        <ExchangeList />

        <footer className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
          <p>hecha con cariño por Nahuel</p>
          <Heart className="h-3.5 w-3.5 text-rose" />
          <p>Oriana</p>
        </footer>
      </main>
    </div>
  );
}