'use client';

import Link from 'next/link';
import lesson01 from '../data/lessons/01-coffee-culture.json';

type LevelKey = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export default function TextCatalog({ level }: { level: LevelKey }) {
  const currentLevel = (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level) ? level : 'A1') as LevelKey;

  const lessons = [
    {
      id: lesson01.id,
      title: lesson01.title,
      image: lesson01.image,
      summary: lesson01.levels[currentLevel]?.fullText.slice(0, 110) + '...',
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col p-4 sm:p-6 font-sans">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <header className="mb-6 pb-4 border-b border-neutral-800 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-neutral-400 hover:text-white transition flex items-center gap-1"
          >
            ← Trocar Nível
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Nível selecionado:</span>
            <span className="text-xs px-2.5 py-1 rounded bg-blue-600 font-bold text-white">
              {currentLevel}
            </span>
          </div>
        </header>

        <section className="flex-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4">
            Escolha um texto para praticar:
          </h2>

          <div className="grid gap-4">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.id}?lvl=${currentLevel}`}
                className="group block bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 transition"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={lesson.image}
                    alt={lesson.title}
                    className="w-full sm:w-36 h-32 object-cover rounded-xl shrink-0 group-hover:opacity-90 transition"
                  />
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition mb-1.5">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {lesson.summary}
                      </p>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-blue-400">
                      Iniciar treino →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}