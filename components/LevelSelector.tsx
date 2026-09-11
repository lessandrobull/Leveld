'use client';

import Link from 'next/link';

type LevelKey = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export default function LevelSelector() {
  const levels: { key: LevelKey; label: string; desc: string }[] = [
    { key: 'A1', label: 'Iniciante', desc: 'Vocabulário simples e frases curtas' },
    { key: 'A2', label: 'Básico', desc: 'Expressões cotidianas e rotina' },
    { key: 'B1', label: 'Intermediário', desc: 'Conversação prática e narrativas' },
    { key: 'B2', label: 'Intermediário Avançado', desc: 'Textos mais ricos e argumentação' },
    { key: 'C1', label: 'Avançado', desc: 'Linguagem fluida e vocabulário amplo' },
    { key: 'C2', label: 'Domínio Pleno', desc: 'Nuances e textos complexos' },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Leveld</h1>
        <p className="text-sm text-neutral-400 mb-8">
          Selecione o seu nível para ver os textos disponíveis:
        </p>

        <div className="grid grid-cols-2 gap-3">
          {levels.map((lvl) => (
            <Link
              key={lvl.key}
              href={`/level/${lvl.key}`}
              className="p-4 bg-neutral-900 border border-neutral-800 hover:border-blue-500 hover:bg-neutral-850 rounded-2xl text-left transition group"
            >
              <span className="text-lg font-bold text-blue-400 block mb-1 group-hover:translate-x-0.5 transition-transform">
                {lvl.key}
              </span>
              <span className="text-xs font-semibold text-neutral-200 block">{lvl.label}</span>
              <span className="text-[11px] text-neutral-500 block mt-1 leading-tight">{lvl.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
