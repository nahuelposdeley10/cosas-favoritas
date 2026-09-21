import ExchangeList from "./components/ExchangeList";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
      <main className="w-full max-w-4xl">
        <header className="mb-8 text-center">
          <p className="font-hand text-2xl text-rose sm:text-3xl">
            un cuaderno a dos manos
          </p>
          <h1 className="mt-1 font-display text-4xl font-medium italic tracking-tight text-ink sm:text-5xl">
            nuestras cosas favoritas
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted sm:text-base">
            Dos listas en una sola hoja: lo que yo te compro y lo que vos me
            comprás. Se tilda, se cumple y se celebra.
          </p>
        </header>

        <ExchangeList />

        <footer className="mt-8 text-center text-xs text-muted">
          <p>hecha con cariño por Nahuel &amp; Oriana</p>
        </footer>
      </main>
    </div>
  );
}