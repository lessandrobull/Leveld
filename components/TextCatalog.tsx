'use client';

import Link from 'next/link';
import { lessons } from '../data/lessons';

type LevelKey = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export default function TextCatalog({ level }: { level: LevelKey }) {
  const currentLevel = (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level) ? level : 'A1') as LevelKey;

  const catalogLessons = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    image: lesson.image,
    summary: lesson.levels[currentLevel]?.fullText
      ? lesson.levels[currentLevel].fullText.slice(0, 110) + '...'
      : '',
  }));

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col p-4 sm:p-6 font-sans">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        
        {/* CABEÇALHO */}
        <header className="mb-6 pb-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-neutral-400 hover:text-white transition flex items-center gap-1"
            >
              ← Trocar Nível
            </Link>
            <span className="text-neutral-600">|</span>
            <h1 className="text-xl font-bold tracking-tight text-white">Leveld</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">Inglês:</span>
            <span className="text-sm px-3 py-1 rounded-lg bg-blue-600 font-bold text-white">
              {currentLevel}
            </span>
          </div>
        </header>

        {/* CATÁLOGO DE TEXTOS */}
        <section className="flex-1">
          <h2 className="text-base font-semibold uppercase tracking-wider text-neutral-400 mb-6 text-center">
            Escolha um texto para praticar
          </h2>

          <div className="grid gap-4">
            {catalogLessons.map((lesson) => (
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
                  <div className="flex flex-col justify-center flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition mb-1.5">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-neutral-400 leading-relaxed text-justify">
                      {lesson.summary}
                    </p>
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