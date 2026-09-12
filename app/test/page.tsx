'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import lesson01 from '../../data/lessons/01-coffee-culture.json';

type LevelKey = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

interface UnitSlot {
  id: number;
  text: string;
}

const levelsList: { key: LevelKey; name: string; desc: string }[] = [
  { key: 'A1', name: 'Iniciante (A1)', desc: 'Frases curtas e vocabulário básico.' },
  { key: 'A2', name: 'Básico (A2)', desc: 'Estruturas simples do cotidiano.' },
  { key: 'B1', name: 'Intermediário (B1)', desc: 'Opiniões e descrições lineares.' },
  { key: 'B2', name: 'Independente (B2)', desc: 'Textos com maior densidade lexical.' },
  { key: 'C1', name: 'Avançado (C1)', desc: 'Estruturas sofisticadas e abstratas.' },
  { key: 'C2', name: 'Domínio Pleno (C2)', desc: 'Nuances acadêmicas e estilísticas.' },
];

export default function TestPage() {
  const [selectedLevel, setSelectedLevel] = useState<LevelKey | null>(null);
  const [step, setStep] = useState<number>(1);
  const [sentenceIndex, setSentenceIndex] = useState<number>(0);

  // Estados dos Exercícios
  const [gistSelected, setGistSelected] = useState<number | null>(null);
  const [gapAnswers, setGapAnswers] = useState<Record<number, string>>({});
  const [bankSlots, setBankSlots] = useState<UnitSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<UnitSlot[]>([]);
  const [orderFeedback, setOrderFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [typedInput, setTypedInput] = useState<string>('');
  const [typingFeedback, setTypingFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isTypingLocked, setIsTypingLocked] = useState<boolean>(false);

  const levelData = selectedLevel ? lesson01.levels[selectedLevel] : null;
  const sentences: string[] = levelData?.sentences || [];
  const currentSentence: string = sentences[sentenceIndex] || '';

  // Chunks (Etapa 3)
  useEffect(() => {
    if (step === 3 && currentSentence && levelData) {
      let units: string[] = [];
      const jsonChunks = (levelData as any).chunks?.[sentenceIndex];

      if (jsonChunks && Array.isArray(jsonChunks)) {
        units = jsonChunks;
      } else {
        units = currentSentence
          .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
          .split(' ')
          .filter(Boolean);
      }

      const slots: UnitSlot[] = units.map((text, idx) => ({ id: idx, text }));
      setBankSlots([...slots].sort(() => Math.random() - 0.5));
      setSelectedSlots([]);
      setOrderFeedback(null);
    }
  }, [step, sentenceIndex, currentSentence, selectedLevel]);

  // Ditado (Etapa 4)
  useEffect(() => {
    if (step === 4) {
      setTypedInput('');
      setTypingFeedback(null);
      setIsTypingLocked(false);
    }
  }, [step, sentenceIndex]);

  const checkOrder = () => {
    const rawTarget = currentSentence.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
    const constructed = selectedSlots.map((s) => s.text).join(' ').replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
    setOrderFeedback(rawTarget === constructed ? 'correct' : 'wrong');
  };

  const checkTyping = () => {
    if (!typedInput.trim()) return;
    const cleanOriginal = currentSentence.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toLowerCase();
    const cleanTyped = typedInput.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toLowerCase();
    setTypingFeedback(cleanOriginal === cleanTyped ? 'correct' : 'wrong');
    setIsTypingLocked(true);
  };

  const gapsData = (levelData as any)?.gaps || [];

  // TELA 1: MENU DE NÍVEIS DE TESTE
  if (!selectedLevel) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="max-w-xl w-full">
          <header className="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-neutral-400 hover:text-white transition">
                ← Voltar à Home
              </Link>
              <span className="text-neutral-700">|</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Sandbox Mode
              </span>
            </div>
            <h1 className="text-lg font-bold text-white">Área de Testes</h1>
          </header>

          <p className="text-sm text-neutral-400 mb-4 text-center">
            Escolha o nível para inspecionar e testar qualquer tela da Lição 01:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {levelsList.map((lvl) => (
              <button
                key={lvl.key}
                onClick={() => {
                  setSelectedLevel(lvl.key);
                  setStep(1);
                  setSentenceIndex(0);
                }}
                className="p-4 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800/80 hover:border-neutral-700 transition flex items-start gap-3 text-left group"
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
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // TELA 2: PAINEL DE CONTROLE MANUAL + CARD DO EXERCÍCIO
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col p-3 sm:p-5 font-sans">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-3">

        {/* CABEÇALHO DO MODO DE TESTES */}
        <header className="flex flex-wrap items-center justify-between gap-2 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLevel(null)}
              className="text-xs sm:text-sm text-neutral-400 hover:text-white transition flex items-center gap-1"
            >
              ← Trocar Nível de Teste
            </button>
            <span className="text-neutral-700">|</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
              {selectedLevel}
            </span>
            <span className="text-xs text-neutral-400 hidden sm:inline">Lição 01: Coffee Culture</span>
          </div>

          <div className="flex items-center gap-1.5">
            {levelsList.map((lvl) => (
              <button
                key={lvl.key}
                onClick={() => {
                  setSelectedLevel(lvl.key);
                  setSentenceIndex(0);
                }}
                className={`px-2 py-1 rounded text-xs font-semibold border transition ${
                  selectedLevel === lvl.key
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {lvl.key}
              </button>
            ))}
          </div>
        </header>

        {/* PAINEL DE ATALHOS RÁPIDOS (ETAPAS E FRASES) */}
        <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            Atalhos Diretos de Exercícios:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 mb-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStep(s);
                  setSentenceIndex(0);
                }}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition ${
                  step === s
                    ? 'bg-blue-600 border-blue-500 text-white font-bold shadow'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                Etapa {s}
              </button>
            ))}
          </div>

          {/* SELETOR DE FRASES (Disponível nas Etapas 3 a 7) */}
          {[3, 4, 5, 6, 7].includes(step) && (
            <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-800 flex-wrap">
              <span className="text-xs text-neutral-400 mr-1">Ir para Frase:</span>
              {sentences.map((_, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSentenceIndex(idx)}
                  className={`px-3 py-1 rounded text-xs font-medium border transition ${
                    sentenceIndex === idx
                      ? 'bg-emerald-600 border-emerald-500 text-white font-bold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  Frase {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CARD DO EXERCÍCIO EM MODO SANDBOX */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm flex-1 flex flex-col justify-between">
          <div className="flex-1 flex flex-col">
            
            {/* TOPO: IMAGEM + PLAYER */}
            <div className="flex flex-col md:flex-row md:items-start gap-4 mb-3">
              <div className={`${step === 2 ? 'hidden md:block' : 'block'} shrink-0`}>
                <img
                  src={lesson01.image}
                  alt={lesson01.title}
                  className="w-full h-28 md:w-48 md:h-28 object-cover rounded-xl border border-neutral-800"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="text-center text-xs font-semibold text-neutral-400 mb-1.5 uppercase tracking-wider">
                  Etapa {step} de 8 {sentences.length > 0 && [3, 4, 5, 6, 7].includes(step) && `— Frase ${sentenceIndex + 1} de ${sentences.length}`}
                </div>

                <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                  {[1, 2, 8].includes(step) ? (
                    <audio
                      key={`full-${selectedLevel}-${step}`}
                      controls
                      src={levelData?.audio}
                      className="w-full h-8"
                    />
                  ) : step === 7 ? (
                    <p className="text-xs text-neutral-500 text-center py-1">Sem áudio nesta etapa (Leitura Solo)</p>
                  ) : (
                    <audio
                      key={`sent-${selectedLevel}-${step}-${sentenceIndex}`}
                      controls
                      src={(levelData as any)?.sentenceAudios?.[sentenceIndex]}
                      className="w-full h-8"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ÁREA INTERATIVA DO EXERCÍCIO */}
            <div className="flex-1 flex flex-col justify-between mt-2">
              
              {/* ETAPA 1: GIST */}
              {step === 1 && (
                <div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 mb-3">
                    <p className="text-sm font-semibold text-neutral-200 mb-2">
                      {(levelData as any)?.gistQuestion?.question}
                    </p>
                    <div className="space-y-2">
                      {(levelData as any)?.gistQuestion?.options.map((opt: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setGistSelected(idx)}
                          className={`w-full text-left p-2.5 rounded-lg text-sm font-medium border transition ${
                            gistSelected === idx
                              ? gistSelected === (levelData as any)?.gistQuestion?.correct
                                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                                : 'border-rose-500 bg-rose-950/40 text-rose-200'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                  >
                    Avançar para Etapa 2 (Livre) →
                  </button>
                </div>
              )}

              {/* ETAPA 2: GAPS */}
              {step === 2 && (
                <div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-sm text-neutral-300 leading-relaxed mb-3 text-justify">
                    {sentences.map((sent: string, sIdx: number) => {
                      const gapObj = gapsData.find((g: any) => g.sentenceIndex === sIdx);
                      if (!gapObj) return <span key={sIdx}>{sent} </span>;
                      const parts = sent.split(new RegExp(`\\b${gapObj.target}\\b`, 'i'));
                      const gapIdx = gapsData.indexOf(gapObj);
                      const isAnswered = gapAnswers[gapIdx] === gapObj.target;
                      return (
                        <span key={sIdx}>
                          {parts[0]}
                          <span className={`px-2 py-0.5 rounded font-bold border ${isAnswered ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-neutral-800 border-neutral-700 text-blue-400'}`}>
                            {gapAnswers[gapIdx] || `[ Lacuna ${gapIdx + 1} ]`}
                          </span>
                          {parts[1] || ''}{' '}
                        </span>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                    {gapsData.map((gap: any, gIdx: number) => (
                      <div key={gIdx} className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
                        <span className="text-xs font-semibold text-neutral-400 block mb-1 text-center">Lacuna {gIdx + 1}</span>
                        <div className="flex gap-1.5">
                          {gap.options.map((opt: string, oIdx: number) => (
                            <button
                              key={oIdx}
                              onClick={() => setGapAnswers((prev) => ({ ...prev, [gIdx]: opt }))}
                              className={`flex-1 py-1 rounded text-xs font-medium border transition ${
                                gapAnswers[gIdx] === opt ? (opt === gap.target ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-rose-950 border-rose-500 text-rose-300') : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSentenceIndex(0);
                      setStep(3);
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                  >
                    Avançar para Etapa 3 (Livre) →
                  </button>
                </div>
              )}

              {/* ETAPA 3: CHUNKS */}
              {step === 3 && (
                <div>
                  <div className="min-h-12 p-3 bg-neutral-950 border border-dashed border-neutral-700 rounded-xl flex flex-wrap gap-2 items-center justify-center mb-3">
                    {selectedSlots.length === 0 ? (
                      <span className="text-xs text-neutral-500">Toque nos blocos abaixo...</span>
                    ) : (
                      selectedSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlots((prev) => prev.filter((s) => s.id !== slot.id))}
                          className="px-2.5 py-1 bg-blue-600 border border-blue-500 text-white text-xs font-medium rounded-lg"
                        >
                          {slot.text}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3 justify-center">
                    {bankSlots.map((slot) => {
                      const isSelected = selectedSlots.some((s) => s.id === slot.id);
                      return (
                        <button
                          key={slot.id}
                          disabled={isSelected}
                          onClick={() => setSelectedSlots((prev) => [...prev, slot])}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                            isSelected ? 'opacity-20 pointer-events-none' : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                          }`}
                        >
                          {slot.text}
                        </button>
                      );
                    })}
                  </div>

                  {orderFeedback && (
                    <p className={`text-xs font-semibold mb-2 text-center ${orderFeedback === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {orderFeedback === 'correct' ? 'Ordem correta!' : 'Ordem incorreta.'}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button onClick={checkOrder} className="w-1/2 py-2 bg-neutral-800 hover:bg-neutral-700 font-semibold rounded-xl text-xs">
                      Checar Ordem
                    </button>
                    <button
                      onClick={() => {
                        if (sentenceIndex + 1 < sentences.length) setSentenceIndex(sentenceIndex + 1);
                        else { setSentenceIndex(0); setStep(4); }
                      }}
                      className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-xs"
                    >
                      Próxima Frase / Etapa (Livre)
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 4: DITADO */}
              {step === 4 && (
                <div>
                  <textarea
                    value={typedInput}
                    disabled={isTypingLocked}
                    onChange={(e) => setTypedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (!isTypingLocked) checkTyping();
                      }
                    }}
                    placeholder="Digite a frase aqui e aperte Enter..."
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 mb-2 resize-none"
                  />

                  {typingFeedback && (
                    <div className="mb-2 text-center">
                      {typingFeedback === 'correct' ? (
                        <p className="text-xs font-semibold text-emerald-400">Frase correta!</p>
                      ) : (
                        <div className="p-2.5 bg-rose-950/40 border border-rose-900/60 rounded-xl text-center mb-1.5">
                          <span className="text-xs font-semibold text-rose-400 block mb-1">Diferente do esperado</span>
                          <p className="text-xs font-medium text-white italic">"{currentSentence}"</p>
                          <button
                            type="button"
                            onClick={() => setIsTypingLocked(false)}
                            className="mt-2 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs"
                          >
                            Tentar de novo
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={checkTyping} className="w-1/2 py-2 bg-neutral-800 hover:bg-neutral-700 font-semibold rounded-xl text-xs">
                      Checar (Enter)
                    </button>
                    <button
                      onClick={() => {
                        if (sentenceIndex + 1 < sentences.length) setSentenceIndex(sentenceIndex + 1);
                        else { setSentenceIndex(0); setStep(5); }
                      }}
                      className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-xs"
                    >
                      Próxima Frase / Etapa (Livre)
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPAS 5, 6 E 7: REPETIÇÃO E LEITURA */}
              {[5, 6, 7].includes(step) && (
                <div className="flex-1 flex flex-col justify-between text-center">
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-sm sm:text-base font-medium text-neutral-200 my-auto">
                    {step === 6 ? (
                      <span className="text-neutral-500 italic">🎧 Texto oculto (Repetição sem texto)</span>
                    ) : (
                      `"${currentSentence}"`
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (sentenceIndex + 1 < sentences.length) setSentenceIndex(sentenceIndex + 1);
                      else { setSentenceIndex(0); setStep(step + 1); }
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                  >
                    Avançar Frase / Etapa (Livre) →
                  </button>
                </div>
              )}

              {/* ETAPA 8: TEXTO INTEGRAL */}
              {step === 8 && (
                <div>
                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-200 leading-relaxed text-sm mb-3 text-justify">
                    {levelData?.fullText}
                  </div>
                  <button
                    onClick={() => {
                      setStep(1);
                      setSentenceIndex(0);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl text-sm transition"
                  >
                    Concluir e Voltar à Etapa 1
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
