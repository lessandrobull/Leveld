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

  // Calibração de Idioma das Orientações: A1/A2 (L1 - PT) | B1/B2/C1/C2 (L2 - EN)
  const isL2 = !['A1', 'A2'].includes(level);

  const t = {
    backTexts: isL2 ? '← Texts' : '← Textos',
    langLabel: isL2 ? 'English:' : 'Inglês:',
    stepCount: (s: number) => (isL2 ? `Step ${s} of 8` : `Etapa ${s} de 8`),
    sentenceCount: (curr: number, total: number) =>
      isL2 ? `Sentence ${curr} of ${total}` : `Frase ${curr} de ${total}`,

    // Etapa 1
    step1Instruction: isL2
      ? 'Listen to the full audio and identify the main topic:'
      : 'Ouça o áudio completo e identifique a ideia principal do texto:',
    step1Question: isL2
      ? (currentLevelData as any).gistQuestion?.question || 'What is the main topic of this text?'
      : 'Qual é o tema principal deste texto?',
    step1Btn: isL2 ? 'Proceed to Step 2 →' : 'Avançar para Etapa 2 →',

    // Etapa 2
    step2Instruction: isL2
      ? 'Listen to the audio and fill in the 3 gaps:'
      : 'Ouça o áudio e preencha as 3 lacunas:',
    step2GapTag: (i: number) => (isL2 ? `[ Gap ${i} ]` : `[ Lacuna ${i} ]`),
    step2GapLabel: (i: number) => (isL2 ? `Gap ${i}:` : `Lacuna ${i}:`),
    step2Btn: isL2 ? 'Proceed to Step 3 →' : 'Avançar para Etapa 3 →',

    // Etapa 3
    step3Instruction: isL2
      ? 'Reconstruct the sentence in the correct order:'
      : 'Reconstrua a frase na ordem correta:',
    step3Prompt: isL2
      ? 'Tap the blocks below to order the sentence...'
      : 'Toque nos blocos abaixo para ordenar a frase...',
    step3Correct: isL2 ? 'Great! Correct order.' : 'Excelente! Ordem correta.',
    step3Wrong: isL2 ? 'Incorrect. Try reordering.' : 'Incorreto. Tente reorganizar.',
    step3CheckBtn: isL2 ? 'Check' : 'Checar',
    step3NextBtn: isL2 ? 'Next' : 'Avançar',

    // Etapa 4
    step4Instruction: isL2
      ? 'Type exactly what you hear:'
      : 'Digite exatamente o que ouviu:',
    step4Placeholder: isL2 ? 'Type the sentence here...' : 'Digite a frase aqui...',
    step4Correct: isL2 ? 'Well done! Correctly typed.' : 'Muito bem! Frase digitada corretamente.',
    step4Wrong: isL2 ? 'Different from expected.' : 'Diferente do esperado.',
    step4Retry: isL2 ? 'Try again' : 'Tentar de novo',
    step4CheckBtn: isL2 ? 'Check Typing' : 'Checar Digitação',
    step4NextBtn: isL2 ? 'Next' : 'Avançar',

    // Etapa 5
    step5Instruction: isL2
      ? 'Repeat the sentence aloud with text support:'
      : 'Repita a frase em voz alta com apoio do texto:',
    nextSentenceBtn: isL2 ? 'Next Sentence →' : 'Próxima Frase →',

    // Etapa 6
    step6Instruction: isL2
      ? 'Repeat orally without the text on screen:'
      : 'Repita oralmente sem o texto na tela:',
    step6Hidden: isL2 ? 'Text hidden in this step' : 'Texto oculto nesta etapa',

    // Etapa 7
    step7Instruction: isL2 ? 'Solo reading aloud:' : 'Leitura solo em voz alta:',
    step7NoAudio: isL2 ? 'No audio' : 'Sem áudio',

    // Etapa 8
    step8Instruction: isL2
      ? 'Play the audio to follow along, then read the entire text aloud:'
      : 'Dê o play para acompanhar a leitura e em seguida leia o texto todo em voz alta:',
    step8CompleteBtn: isL2 ? 'Complete and Return to Start' : 'Concluir e Voltar ao Início',
  };

  // Calibração de Velocidade: Ímpar (Ava) vs Par (Andrew)
  const isAndrew = lessonData.voice === 'Andrew';
  const speedMap: Record<LevelKey, number> = isAndrew
    ? { A1: 0.9, A2: 0.9, B1: 0.95, B2: 0.95, C1: 1.0, C2: 1.0 }
    : { A1: 0.8, A2: 0.8, B1: 0.85, B2: 0.85, C1: 0.9, C2: 0.9 };

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
  const allGapsAnswered =
    gapsData.length > 0 && gapsData.every((g: any, idx: number) => gapAnswers[idx] === g.target);

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
              {t.backTexts}
            </Link>
            <span className="text-neutral-600">|</span>
            <h1 className="text-lg font-bold tracking-tight text-white">Leveld</h1>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">{t.langLabel}</span>
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
                {/* Progresso das Etapas */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>{t.stepCount(step)}</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-300"
                      style={{ width: `${(step / 8) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Orientações e Player */}
                <div className="bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
                  {step === 1 && (
                    <div>
                      <p className="text-xs text-neutral-300 mb-1.5">{t.step1Instruction}</p>
                      <audio
                        key={`${level}-1`}
                        ref={(el) => { if (el) el.playbackRate = speedMap[level]; }}
                        onPlay={(e) => { e.currentTarget.playbackRate = speedMap[level]; }}
                        controls
                        src={currentLevelData.audio}
                        className="w-full h-8"
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <p className="text-xs text-neutral-300 mb-1.5">{t.step2Instruction}</p>
                      <audio
                        key={`${level}-2`}
                        ref={(el) => { if (el) el.playbackRate = speedMap[level]; }}
                        onPlay={(e) => { e.currentTarget.playbackRate = speedMap[level]; }}
                        controls
                        src={currentLevelData.audio}
                        className="w-full h-8"
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-neutral-400 block">
                          {t.sentenceCount(sentenceIndex + 1, sentences.length)}
                        </span>
                        <p className="text-xs text-neutral-300">{t.step3Instruction}</p>
                      </div>
                      <audio
                        key={`step3-${level}-${sentenceIndex}`}
                        ref={(el) => { if (el) el.playbackRate = speedMap[level]; }}
                        onPlay={(e) => { e.currentTarget.playbackRate = speedMap[level]; }}
                        controls
                        src={(currentLevelData as any).sentenceAudios?.[sentenceIndex]}
                        className="w-full sm:w-60 h-8 shrink-0"
                      />
                    </div>
                  )}

                  {step === 4 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-neutral-400 block">
                          {t.sentenceCount(sentenceIndex + 1, sentences.length)}
                        </span>
                        <p className="text-xs text-neutral-300">{t.step4Instruction}</p>
                      </div>
                      <audio
                        key={`step4-${level}-${sentenceIndex}`}
                        ref={(el) => { if (el) el.playbackRate = speedMap[level]; }}
                        onPlay={(e) => { e.currentTarget.playbackRate = speedMap[level]; }}
                        controls
                        src={(currentLevelData as any).sentenceAudios?.[sentenceIndex]}
                        className="w-full sm:w-60 h-8 shrink-0"
                      />
                    </div>
                  )}

                  {step === 5 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-neutral-400 block">
                          {t.sentenceCount(sentenceIndex + 1, sentences.length)}
                        </span>
                        <p className="text-xs text-neutral-300">{t.step5Instruction}</p>
                      </div>
                      <audio
                        key={`step5-${level}-${sentenceIndex}`}
                        ref={(el) => { if (el) el.playbackRate = speedMap[level]; }}
                        onPlay={(e) => { e.currentTarget.playbackRate = speedMap[level]; }}
                        controls
                        src={(currentLevelData as any).sentenceAudios?.[sentenceIndex]}
                        className="w-full sm:w-60 h-8 shrink-0"
                      />
                    </div>
                  )}

                  {step === 6 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs text-neutral-400 block">
                          {t.sentenceCount(sentenceIndex + 1, sentences.length)}
                        </span>
                        <p className="text-xs text-neutral-300">{t.step6Instruction}</p>
                      </div>
                      <audio
                        key={`step6-${level}-${sentenceIndex}`}
                        ref={(el) => { if (el) el.playbackRate = speedMap[level]; }}
                        onPlay={(e) => { e.currentTarget.playbackRate = speedMap[level]; }}
                        controls
                        src={(currentLevelData as any).sentenceAudios?.[sentenceIndex]}
                        className="w-full sm:w-60 h-8 shrink-0"
                      />
                    </div>
                  )}

                  {step === 7 && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-neutral-400 block">
                          {t.sentenceCount(sentenceIndex + 1, sentences.length)}
                        </span>
                        <p className="text-xs text-neutral-300">{t.step7Instruction}</p>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono">{t.step7NoAudio}</span>
                    </div>
                  )}

                  {step === 8 && (
                    <div>
                      <p className="text-xs text-neutral-300 mb-1.5">{t.step8Instruction}</p>
                      <audio
                        key={`${level}-8`}
                        ref={(el) => { if (el) el.playbackRate = speedMap[level]; }}
                        onPlay={(e) => { e.currentTarget.playbackRate = speedMap[level]; }}
                        controls
                        src={currentLevelData.audio}
                        className="w-full h-8"
                      />
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
                      {t.step1Question}
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
                    {t.step1Btn}
                  </button>
                </div>
              )}

              {/* ETAPA 2 (Kindle Style Justified) */}
              {step === 2 && (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs sm:text-sm text-neutral-300 leading-relaxed mb-3 text-justify">
                      {sentences.map((sent, sIdx) => {
                        const gapObj = gapsData.find((g: any) => g.sentenceIndex === sIdx);
                        if (!gapObj) return <span key={sIdx}>{sent} </span>;

                        const parts = sent.split(new RegExp(`\\b${gapObj.target}\\b`, 'i'));
                        const gapIdx = gapsData.indexOf(gapObj);
                        const isAnswered = gapAnswers[gapIdx] === gapObj.target;

                        return (
                          <span key={sIdx}>
                            {parts[0]}
                            <span
                              className={`px-2 py-0.5 rounded font-bold border ${
                                isAnswered
                                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                                  : 'bg-neutral-800 border-neutral-700 text-blue-400'
                              }`}
                            >
                              {gapAnswers[gapIdx] || t.step2GapTag(gapIdx + 1)}
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
                            {t.step2GapLabel(gIdx + 1)}
                          </span>
                          <div className="flex gap-1.5">
                            {gap.options.map((opt: string, oIdx: number) => (
                              <button
                                key={oIdx}
                                onClick={() => setGapAnswers((prev) => ({ ...prev, [gIdx]: opt }))}
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
                    {t.step2Btn}
                  </button>
                </div>
              )}

              {/* ETAPA 3 */}
              {step === 3 && (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="min-h-12 p-2.5 bg-neutral-950 border border-dashed border-neutral-700 rounded-xl flex flex-wrap gap-1.5 items-center mb-2.5">
                      {selectedUnits.length === 0 ? (
                        <span className="text-xs text-neutral-500">{t.step3Prompt}</span>
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
                      <p
                        className={`text-xs font-semibold mb-2 text-center ${
                          orderFeedback === 'correct' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {orderFeedback === 'correct' ? t.step3Correct : t.step3Wrong}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={checkOrder}
                      className="w-1/2 py-2 bg-neutral-800 hover:bg-neutral-700 font-semibold rounded-xl text-xs transition"
                    >
                      {t.step3CheckBtn}
                    </button>
                    <button
                      onClick={nextSentenceOrStep}
                      disabled={orderFeedback !== 'correct'}
                      className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed font-semibold rounded-xl text-xs transition"
                    >
                      {t.step3NextBtn}
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
                      placeholder={t.step4Placeholder}
                      rows={2}
                      className={`w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs sm:text-sm focus:outline-none focus:border-blue-500 mb-2 resize-none ${
                        isTypingLocked ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />

                    {typingFeedback && (
                      <div className="mb-2 text-center">
                        {typingFeedback === 'correct' ? (
                          <p className="text-xs font-semibold text-emerald-400">{t.step4Correct}</p>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs font-semibold text-rose-400">{t.step4Wrong}</span>
                            <button
                              type="button"
                              onClick={handleRetryTyping}
                              className="px-2.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md text-xs font-medium transition"
                            >
                              {t.step4Retry}
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
                      {t.step4CheckBtn}
                    </button>
                    <button
                      onClick={nextSentenceOrStep}
                      disabled={typingFeedback !== 'correct'}
                      className="w-1/2 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed font-semibold rounded-xl text-xs transition"
                    >
                      {t.step4NextBtn}
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
                    {t.nextSentenceBtn}
                  </button>
                </div>
              )}

              {/* ETAPA 6 */}
              {step === 6 && (
                <div className="flex-1 flex flex-col justify-between text-center">
                  <div className="p-5 bg-neutral-950/60 border border-dashed border-neutral-800 rounded-xl my-auto flex flex-col items-center justify-center">
                    <span className="text-2xl mb-1">🎧</span>
                    <span className="text-xs text-neutral-500 font-medium">{t.step6Hidden}</span>
                  </div>
                  <button
                    onClick={nextSentenceOrStep}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-xs transition"
                  >
                    {t.nextSentenceBtn}
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
                    {t.nextSentenceBtn}
                  </button>
                </div>
              )}

              {/* ETAPA 8 (Kindle Style Justified) */}
              {step === 8 && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-200 leading-relaxed text-xs sm:text-sm mb-3 text-justify">
                    {currentLevelData.fullText}
                  </div>
                  <button
                    onClick={() => {
                      setStep(1);
                      setSentenceIndex(0);
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl text-xs transition"
                  >
                    {t.step8CompleteBtn}
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
