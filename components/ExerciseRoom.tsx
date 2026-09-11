'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import lessonData from '../data/lessons/01-coffee-culture.json';

type LevelKey = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export default function ExerciseRoom() {
  const searchParams = useSearchParams();
  const initialLvl = (searchParams.get('lvl') as LevelKey) || 'A1';

  const [level, setLevel] = useState<LevelKey>(initialLvl);
  const [step, setStep] = useState<number>(1);
  const [sentenceIndex, setSentenceIndex] = useState<number>(0);

  // Estados da Etapa 1 (Gist)
  const [gistSelected, setGistSelected] = useState<number | null>(null);

  // Estados da Etapa 2 (Gaps)
  const [gapAnswers, setGapAnswers] = useState<Record<number, string>>({});

  // Estados da Etapa 3 (Sintaxe)
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [orderFeedback, setOrderFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Estados da Etapa 4 (Ditado)
  const [typedInput, setTypedInput] = useState<string>('');
  const [typingFeedback, setTypingFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isTypingLocked, setIsTypingLocked] = useState<boolean>(false);

  const currentLevelData = lessonData.levels[level];
  const sentences = currentLevelData.sentences || [];
  const currentSentence = sentences[sentenceIndex] || '';

  // Calibração de Velocidade: Ímpar (Ava) vs Par (Andrew)
  const isAndrew = lessonData.voice === 'Andrew';
  const speedMap: Record<LevelKey, number> = isAndrew
    ? { A1: 0.9, A2: 0.9, B1: 0.95, B2: 0.95, C1: 1.0, C2: 1.0 }
    : { A1: 0.8, A2: 0.8, B1: 0.85, B2: 0.85, C1: 0.9, C2: 0.9 };

  const speakSentence = (_text: string) => {
    const audios = (currentLevelData as any).sentenceAudios;
    if (audios && audios[sentenceIndex]) {
      const audio = new Audio(audios[sentenceIndex]);
      audio.playbackRate = speedMap[level];
      audio.play().catch((err) => console.error('Erro ao tocar áudio:', err));
    }
  };

  useEffect(() => {
    if (step === 3 && currentSentence) {
      const cleanWords = currentSentence
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
        .split(' ')
        .filter(Boolean);

      let units: string[] = [];
      if (['B2', 'C1', 'C2'].includes(level)) {
        for (let i = 0; i < cleanWords.length; i += 2) {
          units.push(cleanWords.slice(i, i + 2).join(' '));
        }
      } else {
        units = [...cleanWords];
      }

      setAvailableUnits([...units].sort(() => Math.random() - 0.5));
      setSelectedUnits([]);
      setOrderFeedback(null);
    }
  }, [step, sentenceIndex, currentSentence, level]);

  useEffect(() => {
    if (step === 4) {
      setTypedInput('');
      setTypingFeedback(null);
      setIsTypingLocked(false);
    }
  }, [step, sentenceIndex]);

  const handleUnitClick = (unit: string, fromAvailable: boolean) => {
    if (orderFeedback === 'correct') return;
    if (fromAvailable) {
      const idx = availableUnits.indexOf(unit);
      const updated = [...availableUnits];
      updated.splice(idx, 1);
      setAvailableUnits(updated);
      setSelectedUnits([...selectedUnits, unit]);
    } else {
      const idx = selectedUnits.indexOf(unit);
      const updated = [...selectedUnits];
      updated.splice(idx, 1);
      setSelectedUnits(updated);
      setAvailableUnits([...availableUnits, unit]);
    }
  };

  const checkOrder = () => {
    const rawTarget = currentSentence.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toLowerCase();
    const constructed = selectedUnits.join(' ').trim().toLowerCase();
    if (rawTarget === constructed) {
      setOrderFeedback('correct');
    } else {
      setOrderFeedback('wrong');
    }
  };

  const checkTyping = () => {
    const cleanOriginal = currentSentence.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toLowerCase();
    const cleanTyped = typedInput.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toLowerCase();
    if (cleanOriginal === cleanTyped) {
      setTypingFeedback('correct');
      setIsTypingLocked(true);
    } else {
      setTypingFeedback('wrong');
      setIsTypingLocked(true);
    }
  };

  const handleRetryTyping = () => {
    setIsTypingLocked(false);
    setTypingFeedback(null);
  };

  const nextSentenceOrStep = () => {
    if (sentenceIndex + 1 < sentences.length) {
      setSentenceIndex(sentenceIndex + 1);
    } else {
      setSentenceIndex(0);
      setStep((prev) => Math.min(prev + 1, 8));
    }
  };

  const gapsData = (currentLevelData as any).gaps || [];
  const allGapsAnswered = gapsData.length > 0 && gapsData.every((g: any, idx: number) => gapAnswers[idx] === g.target);

  return (
    <main className="h-screen max-h-screen bg-neutral-950 text-neutral-100 flex flex-col p-3 sm:p-5 font-sans overflow-hidden">
      <div className="max-w-2xl md:max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0">
        
        {/* LINHA 1: Topo */}
        <header className="flex items-center justify-between pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href={`/level/${level}`}
              className="text-xs text-neutral-400 hover:text-white transition flex items-center gap-1"
            >
              ← Textos
            </Link>
            <span className="text-neutral-600">|</span>
            <h1 className="text-lg font-bold tracking-tight text-white">Decoda</h1>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">Nível:</span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white">
              {level}
            </span>
          </div>
        </header>

        {/* LINHA 2: Título Centralizado */}
        <div className="pb-2.5 shrink-0 text-center">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-200 truncate">
            {lessonData.title}
          </h2>
        </div>

        {/* LINHA 3 ATÉ O BOTTOM: Card de tamanho fixo */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm flex-1 min-h-0 overflow-y-auto flex flex-col justify-between">
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* BLOCO SUPERIOR */}
            <div className="flex flex-col md:flex-row md:items-start gap-4 mb-3 shrink-0">
              
              {/* Imagem */}
              <div className={`${step === 2 ? 'hidden md:block' : 'block'} shrink-0`}>
                <img
                  src={lessonData.image}
                  alt={lessonData.title}
                  className="w-full h-32 md:w-56 md:h-32 lg:w-64 lg:h-36 object-cover rounded-xl border border-neutral-800 shadow-sm"
                />
              </div>

              {/* Coluna Direita (PC) / Superior (Mobile) */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                {/* Progresso das Etapas (Apenas contagem) */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Etapa {step} de 8</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-300"
                      style={{ width: `${(step / 8) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Orientações e Player/Botão ▶ */}
                <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
                  {step === 1 && (
                    <div>
                      <p className="text-xs text-neutral-300 mb-1.5">
                        Ouça o áudio completo e identifique a ideia principal do texto (sem apoio visual):
                      </p>
                      <audio key={`${level}-1`} controls src={currentLevelData.audio} className="w-full h-8" />
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <p className="text-xs text-neutral-300 mb-1.5">
                        Ouça o áudio e preencha as 3 lacunas contextuais principais:
                      </p>
                      <audio key={`${level}-2`} controls src={currentLevelData.audio} className="w-full h-8" />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-neutral-400 block">
                          Frase {sentenceIndex + 1} de {sentences.length}
                        </span>
                        <p className="text-xs text-neutral-300">Reconstrua a frase na ordem correta:</p>
                      </div>
                      <button
                        onClick={() => speakSentence(currentSentence)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-blue-400 text-xs rounded-full font-medium transition"
                      >
                        <span>Ouvir Frase</span>
                        <span className="text-[10px]">▶</span>
                      </button>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-neutral-400 block">
                          Frase {sentenceIndex + 1} de {sentences.length}
                        </span>
                        <p className="text-xs text-neutral-300">Digite exatamente o que ouviu:</p>
                      </div>
                      <button
                        onClick={() => speakSentence(currentSentence)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-blue-400 text-xs rounded-full font-medium transition"
                      >
                        <span>Ouvir Trecho</span>
                        <span className="text-[10px]">▶</span>
                      </button>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-neutral-400 block">
                          Frase {sentenceIndex + 1} de {sentences.length}
                        </span>
                        <p className="text-xs text-neutral-300">Repita a frase em voz alta com apoio do texto:</p>
                      </div>
                      <button
                        onClick={() => speakSentence(currentSentence)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-blue-400 text-xs rounded-full font-medium transition"
                      >
                        <span>Ouvir Modelo</span>
                        <span className="text-[10px]">▶</span>
                      </button>
                    </div>
                  )}

                  {step === 6 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-neutral-400 block">
                          Frase {sentenceIndex + 1} de {sentences.length}
                        </span>
                        <p className="text-xs text-neutral-300">Repita oralmente sem o texto na tela:</p>
                      </div>
                      <button
                        onClick={() => speakSentence(currentSentence)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-blue-400 text-xs rounded-full font-medium transition"
                      >
                        <span>Ouvir Modelo</span>
                        <span className="text-[10px]">▶</span>
                      </button>
                    </div>
                  )}

                  {step === 7 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-neutral-400 block">
                          Frase {sentenceIndex + 1} de {sentences.length}
                        </span>
                        <p className="text-xs text-neutral-300">Leitura solo e autônoma em voz alta:</p>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono">Sem áudio</span>
                    </div>
                  )}

                  {step === 8 && (
                    <div>
                      <p className="text-xs text-neutral-300 mb-1.5">
                        Dê o play para acompanhar e realize a leitura oral contínua do texto completo:
                      </p>
                      <audio key={`${level}-8`} controls src={currentLevelData.audio} className="w-full h-8" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ÁREA INFERIOR */}
            <div className="flex-1 flex flex-col justify-between min-h-0">
              
              {/* ETAPA 1 */}
              {step === 1 && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <p className="text-sm font-semibold text-neutral-200 mb-2">
                      {(currentLevelData as any).gistQuestion?.question}
                    </p>
                    <div className="space-y-1.5">
                      {(currentLevelData as any).gistQuestion?.options.map((opt: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setGistSelected(idx)}
                          className={`w-full text-left p-2 rounded-lg text-xs font-medium border transition ${
                            gistSelected === idx
                              ? gistSelected === (currentLevelData as any).gistQuestion?.correct
                                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
                                : 'border-rose-500 bg-rose-950/40 text-rose-200'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    disabled={gistSelected !== (currentLevelData as any).gistQuestion?.correct}
                    onClick={() => setStep(2)}
                    className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed font-semibold rounded-xl text-xs transition"
                  >
                    Avançar para Etapa 2 →
                  </button>
                </div>
              )}

              {/* ETAPA 2 */}
              {step === 2 && (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs sm:text-sm text-neutral-300 leading-relaxed mb-3">
                      {sentences.map((sent, sIdx) => {
                        const gapObj = gapsData.find((g: any) => g.sentenceIndex === sIdx);
                        if (!gapObj) return <span key={sIdx}>{sent} </span>;

                        const parts = sent.split(new RegExp(`\\b${gapObj.target}\\b`, 'i'));
                        const gapIdx = gapsData.indexOf(gapObj);
                        const isAnswered = gapAnswers[gapIdx] === gapObj.target;

                        return (
                          <span key={sIdx}>
                            {parts[0]}
                            <span className={`px-2 py-0.5 rounded font-bold border ${
                              isAnswered ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-neutral-800 border-neutral-700 text-blue-400'
                            }`}>
                              {gapAnswers[gapIdx] || `[ Lacuna ${gapIdx + 1} ]`}
                            </span>
                            {parts[1] || ''}{' '}
                          </span>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                      {gapsData.map((gap: any, gIdx: number) => (
                        <div key={gIdx} className="p-2 bg-neutral-950 rounded-lg border border-neutral-800">
                          <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                            Lacuna {gIdx + 1}:
                          </span>
                          <div className="flex gap-1.5">
                            {gap.options.map((opt: string, oIdx: number) => (
                              <button
                                key={oIdx}
                                onClick={() => setGapAnswers(prev => ({ ...prev, [gIdx]: opt }))}
                                className={`flex-1 py-1 rounded text-xs font-medium border transition ${
                                  gapAnswers[gIdx] === opt
                                    ? opt === gap.target
                                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                                      : 'bg-rose-950 border-rose-500 text-rose-300'
                                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={!allGapsAnswered}
                    onClick={() => {
                      setSentenceIndex(0);
                      setStep(3);
                    }}
                    className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed font-semibold rounded-xl text-xs transition"
                  >
                    Avançar para Etapa 3 →
                  </button>
                </div>
              )}

              {/* ETAPA 3 */}
              {step === 3 && (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="min-h-12 p-2.5 bg-neutral-950 border border-dashed border-neutral-700 rounded-xl flex flex-wrap gap-1.5 items-center mb-2.5">
                      {selectedUnits.length === 0 ? (
                        <span className="text-xs text-neutral-500">Toque nos blocos abaixo para ordenar a frase...</span>
                      ) : (
                        selectedUnits.map((unit, i) => (
                          <button
                            key={i}
                            onClick={() => handleUnitClick(unit, false)}
                            className="px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition"
                          >
                            {unit}
                          </button>
                        ))
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {availableUnits.map((unit, i) => (
                        <button
                          key={i}
                          onClick={() => handleUnitClick(unit, true)}
                          className="px-2.5 py-1 bg-neutral-800 text-neutral-300 text-xs rounded-lg hover:bg-neutral-700 transition"
                        >
                          {unit}
                        </button>
                      ))}
                    </div>

                    {orderFeedback && (
                      <p className={`text-xs font-semibold mb-2 text-center ${orderFeedback === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {orderFeedback === 'correct' ? 'Excelente! Ordem correta.' : 'Incorreto. Tente reorganizar.'}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={checkOrder}
                      className="w-1/2 py-2 bg-neutral-800 hover:bg-neutral-700 font-semibold rounded-xl text-xs transition"
                    >
                      Checar
                    </button>
                    <button
                      onClick={nextSentenceOrStep}
                      disabled={orderFeedback !== 'correct'}
                      className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed font-semibold rounded-xl text-xs transition"
                    >
                      Avançar
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 4 */}
              {step === 4 && (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <textarea
                      value={typedInput}
                      disabled={isTypingLocked}
                      onChange={(e) => setTypedInput(e.target.value)}
                      placeholder="Digite a frase aqui..."
                      rows={2}
                      className={`w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-blue-500 mb-2 resize-none ${
                        isTypingLocked ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />

                    {typingFeedback && (
                      <div className="mb-2 text-center">
                        {typingFeedback === 'correct' ? (
                          <p className="text-xs font-semibold text-emerald-400">Muito bem! Frase digitada corretamente.</p>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs font-semibold text-rose-400">Diferente do esperado.</span>
                            <button
                              type="button"
                              onClick={handleRetryTyping}
                              className="px-2.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md text-xs font-medium transition"
                            >
                              Tentar de novo
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={checkTyping}
                      disabled={isTypingLocked && typingFeedback === 'wrong'}
                      className="w-1/2 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed font-semibold rounded-xl text-xs transition"
                    >
                      Checar Digitação
                    </button>
                    <button
                      onClick={nextSentenceOrStep}
                      disabled={typingFeedback !== 'correct'}
                      className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed font-semibold rounded-xl text-xs transition"
                    >
                      Avançar
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 5 */}
              {step === 5 && (
                <div className="flex-1 flex flex-col justify-between text-center">
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm sm:text-base font-medium text-neutral-200 my-auto">
                    "{currentSentence}"
                  </div>
                  <button
                    onClick={nextSentenceOrStep}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-xs transition"
                  >
                    Próxima Frase →
                  </button>
                </div>
              )}

              {/* ETAPA 6 */}
              {step === 6 && (
                <div className="flex-1 flex flex-col justify-between text-center">
                  <div className="p-5 bg-neutral-950/60 border border-dashed border-neutral-800 rounded-xl my-auto flex flex-col items-center justify-center">
                    <span className="text-2xl mb-1">🎧</span>
                    <span className="text-xs text-neutral-500 font-medium">Texto oculto nesta etapa</span>
                  </div>
                  <button
                    onClick={nextSentenceOrStep}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-xs transition"
                  >
                    Próxima Frase →
                  </button>
                </div>
              )}

              {/* ETAPA 7 */}
              {step === 7 && (
                <div className="flex-1 flex flex-col justify-between text-center">
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-sm sm:text-base font-medium text-neutral-200 my-auto">
                    "{currentSentence}"
                  </div>
                  <button
                    onClick={nextSentenceOrStep}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-xs transition"
                  >
                    Próxima Frase →
                  </button>
                </div>
              )}

              {/* ETAPA 8 */}
              {step === 8 && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-200 leading-relaxed text-xs sm:text-sm mb-3">
                    {currentLevelData.fullText}
                  </div>
                  <button
                    onClick={() => {
                      setStep(1);
                      setSentenceIndex(0);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl text-xs transition"
                  >
                    Concluir e Voltar ao Início
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
