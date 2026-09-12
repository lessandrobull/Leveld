'use client';

import Link from 'next/link';

interface LevelOption {
  key: string;
  name: string;
  desc: string;
  color: string;
}

const levels: LevelOption[] = [
  { key: 'A1', name: 'Iniciante', desc: 'Frases simples e vocabulário básico do dia a dia.', color: 'from-emerald-500/20 to-emerald-500/5' },
  { key: 'A2', name: 'Básico', desc: 'Comunicação direta sobre tarefas rotineiras.', color: 'from-cyan-500/20 to-cyan-500/5' },
  { key: 'B1', name: 'Intermediário', desc: 'Compreensão de pontos principais sobre temas comuns.', color: 'from-blue-500/20 to-blue-500/5' },
  { key: 'B2', name: 'Independente', desc: 'Fluência em tópicos complexos e técnicos.', color: 'from-indigo-500/20 to-indigo-500/5' },
  { key: 'C1', name: 'Avançado', desc: 'Compreensão ampla de textos longos e exigentes.', color: 'from-purple-500/20 to-purple-500/5' },
  { key: 'C2', name: 'Domínio Pleno', desc: 'Facilidade para compreender tudo com precisão nativa.', color: 'from-rose-500/20 to-rose-500/5' },
];

export default function LevelSelector() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-xl w-full">
        
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Leveld
          </h1>
          <p className="text-sm sm:text-base text-neutral-400">
            Selecione seu nível de inglês para iniciar os treinos:
          </p>
        </header>

        {/* GRID DE NÍVEIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {levels.map((lvl) => (
            <Link
              key={lvl.key}
              href={`/level/${lvl.key}`}
              className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/80 hover:border-neutral-700 transition flex items-start gap-3 group"
            >
              <span className="px-2.5 py-1 rounded-lg text-sm font-bold bg-blue-600/20 border border-blue-500/30 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition">
                {lvl.key}
              </span>
              <div>
                <h2 className="text-sm font-semibold text-white group-hover:text-blue-400 transition">
                  {lvl.name}
                </h2>
                <p className="text-xs text-neutral-400 leading-snug mt-0.5">
                  {lvl.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* BOTÃO DA ÁREA DE TESTES */}
        <div className="pt-2 border-t border-neutral-900 text-center">
          <Link
            href="/test"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-neutral-400 bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 hover:text-white transition"
          >
            <span>🛠️</span>
            <span>Área de Testes (Sandbox / Dev Mode)</span>
          </Link>
        </div>

      </div>
    </main>
  );
}
