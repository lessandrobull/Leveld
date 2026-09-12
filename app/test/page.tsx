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
  { key: 'A1', name: 'Iniciante', desc: 'Frases simples e vocabulário básico do dia a dia.' },
  { key: 'A2', name: 'Básico', desc: 'Comunicação direta sobre tarefas rotineiras.' },
  { key: 'B1', name: 'Intermediário', desc: 'Compreensão de pontos principais sobre temas comuns.' },
  { key: 'B2', name: 'Independente', desc: 'Fluência em tópicos complexos e técnicos.' },
  { key: 'C1', name: 'Avançado', desc: 'Compreensão ampla de textos longos e exigentes.' },
  { key: 'C2', name: 'Domínio Pleno', desc: 'Facilidade para compreender tudo com precisão nativa.' },
];

const stepNames = [
  { step: 1, title: 'Passo 1: Gist (Ideia Principal)' },
  { step: 2, title: 'Passo 2: Gaps (Preenchimento de Lacunas)' },
  { step: 3, title: 'Passo 3: Sintaxe (Ordenação de Chunks)' },
  { step: 4, title: 'Passo 4: Ditado (Digitação)' },
  { step: 5, title: 'Passo 5: Repetição com Texto' },
  { step: 6, title: 'Passo 6: Repetição sem Texto' },
  { step: 7, title: 'Passo 7: Leitura Solo' },
  { step: 8, title: 'Passo 8: Texto Completo' },
];

export default function TestPage() {
  const [selectedLevel, setSelectedLevel] = useState<LevelKey | null>(null);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  // Estados dos exercícios
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
  const currentSentence: string = sentences[0] || '';

  const isL2 = selectedLevel ? !['A1', 'A2'].includes(selectedLevel) : false;

  const t = {
    backSteps: isL2 ? '← Steps' : '← Passos',
    langLabel: isL2 ? 'English:' : 'Inglês:',
    stepCount: (s: number) => (isL2 ? `Step ${s} of 8` : `Etapa ${s} de 8`),
    sentenceCount: isL2 ? `Sentence 1 of ${sentences.length}` : `Frase 1 de ${sentences.length}`,

    step1Instruction: isL2
      ? 'Listen to the full audio and identify the main topic:'
      : 'Ouça o áudio completo e identifique a ideia principal do texto:',
    step1Question: isL2
      ? (levelData as any)?.gistQuestion?.question || 'What is the main topic of this text?'
      : 'Qual é o tema principal deste texto?',
    step1Btn: isL2 ? 'Proceed to Step 2 →' : 'Avançar para Etapa 2 →',

    step2Instruction: isL2
      ? 'Listen to the audio and fill in the 3 gaps:'
      : 'Ouça o áudio e preencha as 3 lacunas:',
    step2GapTag: (i: number) => (isL2 ? `[ Gap ${i} ]` : `[ Lacuna ${i} ]`),
    step2GapLabel: (i: number) => (isL2 ? `Gap ${i}` : `Lacuna ${i}`),
    step2Btn: isL2 ? 'Proceed to Step 3 →' : 'Avançar para Etapa 3 →',

    step3Instruction: isL2
      ? 'Reconstruct the sentence in the correct order:'
      : 'Reconstrua a frase na ordem correta:',
    step3Prompt: isL2 ? 'Tap the blocks below to order the sentence...' : 'Toque nos blocos abaixo para ordenar a frase...',
    step3Correct: isL2 ? 'Great! Correct order.' : 'Excelente! Ordem correta.',
    step3Wrong: isL2 ? 'Incorrect. Tap a block to adjust.' : 'Incorreto. Toque em um bloco para ajustar.',
    step3CheckBtn: isL2 ? 'Check' : 'Checar',
    step3NextBtn: isL2 ? 'Next' : 'Avançar',

    step4Instruction: isL2 ? 'Type exactly what you hear:' : 'Digite exatamente o que ouviu:',
    step4Placeholder: isL2 ? 'Type the sentence here...' : 'Digite a frase aqui...',
    step4Correct: isL2 ? 'Well done! Correctly typed.' : 'Muito bem! Frase digitada corretamente.',
    step4Wrong: isL2 ? 'Different from expected.' : 'Diferente do esperado.',
    step4CorrectSentenceLabel: isL2 ? 'Correct sentence:' : 'Frase correta:',
    step4Retry: isL2 ? 'Try again' : 'Tentar de novo',
    step4CheckBtn: isL2 ? 'Check Typing' : 'Checar Digitação',
    step4NextBtn: isL2 ? 'Next' : 'Avançar',

    step5Instruction: isL2 ? 'Repeat the sentence aloud with text support:' : 'Repita a frase em voz alta com apoio do texto:',
    nextSentenceBtn: isL2 ? 'Next Sentence →' : 'Próxima Frase →',

    step6Instruction: isL2 ? 'Repeat orally without the text on screen:' : 'Repita oralmente sem o texto na tela:',
    step6Hidden: isL2 ? 'Text hidden in this step' : 'Texto oculto nesta etapa',

    step7Instruction: isL2 ? 'Solo reading aloud:' : 'Leitura solo em voz alta:',
    step7NoAudio: isL2 ? 'No audio' : 'Sem áudio',

    step8Instruction: isL2
      ? 'Play the audio to follow along, then read the entire text aloud:'
      : 'Dê o play para acompanhar a leitura e em seguida leia o texto todo em voz alta:',
    step8CompleteBtn: isL2 ? 'Complete and Return to Start' : 'Concluir e Voltar ao Início',
  };

  useEffect(() => {
    if (selectedStep === 3 && currentSentence && levelData) {
      let units: string[] = [];
      const jsonChunks = (levelData as any).chunks?.[0];

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
  }, [selectedStep, currentSentence, selectedLevel]);

  useEffect(() => {
    if (selectedStep === 4) {
      setTypedInput('');
      setTypingFeedback(null);
      setIsTypingLocked(false);
    }
  }, [selectedStep]);

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

  // ==========================================
  // TELA 1: ESCOLHA DO NÍVEL (FIXO NO TOPO)
  // ==========================================
  if (!selectedLevel) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col p-4 sm:p-6 font-sans">
        <div className="max-w-xl mx-auto w-full flex-1 flex flex-col">
          <header className="mb-6 pb-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-neutral-400 hover:text-white transition">
                Home
              </Link>
              <span className="text-neutral-700">|</span>
              <h1 className="text-lg font-bold text-white">Área de Testes</h1>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {levelsList.map((lvl) => (
              <button
                key={lvl.key}
                onClick={() => {
                  setSelectedLevel(lvl.key);
                  setSelectedStep(null);
                }}
                className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800/80 hover:border-neutral-700 transition flex items-start gap-3 text-left group"
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

  // ==========================================
  // TELA 2: ESCOLHA DO PASSO (FIXO NO TOPO, SEM TEXTO EXTRA)
  // ==========================================
  if (selectedStep === null) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col p-4 sm:p-6 font-sans">
        <div className="max-w-xl mx-auto w-full flex-1 flex flex-col">
          <header className="mb-6 pb-4 border-b border-neutral-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedLevel(null)}
                className="text-sm text-neutral-400 hover:text-white transition"
              >
                ← Níveis
              </button>
              <span className="text-neutral-700">|</span>
              <h1 className="text-lg font-bold text-white">Área de Testes</h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-600 font-bold text-white">
                {selectedLevel}
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-2.5">
            {stepNames.map((item) => (
              <button
                key={item.step}
                onClick={() => setSelectedStep(item.step)}
                className="w-full p-3.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:border-neutral-700 text-left font-semibold text-sm text-neutral-200 hover:text-blue-400 transition"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // TELA 3: CARD REAL (LAYOUT IDÊNTICO)
  // ==========================================
  return (
    <main className="h-screen max-h-screen bg-neutral-950 text-neutral-100 flex flex-col p-3 sm:p-5 font-sans overflow-hidden">
      <div className="max-w-2xl md:max-w-5xl mx-auto w-full flex-1 flex flex-col min-h-0">

        {/* CABEÇALHO */}
        <header className="flex items-center justify-between pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedStep(null)}
              className="text-sm text-neutral-400 hover:text-white transition flex items-center gap-1"
            >
              {t.backSteps}
            </button>
            <span className="text-neutral-600">|</span>
            <h1 className="text-xl font-bold tracking-tight text-white">Leveld</h1>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-sm text-neutral-400">{t.langLabel}</span>
            <span className="px-3 py-1 rounded-lg text-sm font-bold bg-blue-600 text-white">
              {selectedLevel}
            </span>
          </div>
        </header>

        {/* TÍTULO */}
        <div className="pb-2.5 shrink-0 text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-200 truncate">
            {lesson01.title}
          </h2>
        </div>

        {/* CARD */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm flex-1 min-h-0 overflow-y-auto flex flex-col justify-between">
          <div className="flex-1 flex flex-col min-h-0">

            {/* BLOCO SUPERIOR */}
            <div className="flex flex-col md:flex-row md:items-start gap-4 mb-3 shrink-0">
              <div className={`${selectedStep === 2 ? 'hidden md:block' : 'block'} shrink-0`}>
                <img
                  src={lesson01.image}
                  alt={lesson01.title}
                  className="w-full h-32 md:w-56 md:h-32 lg:w-64 lg:h-36 object-cover rounded-xl border border-neutral-800 shadow-sm"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="mb-2">
                  <div className="text-center text-sm font-medium text-neutral-400 mb-1.5">
                    <span>{t.stepCount(selectedStep)}</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-300"
                      style={{ width: `${(selectedStep / 8) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                  {selectedStep === 1 && (
                    <div className="text-center">
                      <p className="text-sm text-neutral-300 mb-2">{t.step1Instruction}</p>
                      <audio controls src={levelData?.audio} className="w-full h-8" />
                    </div>
                  )}

                  {selectedStep === 2 && (
                    <div className="text-center">
                      <p className="text-sm text-neutral-300 mb-2">{t.step2Instruction}</p>
                      <audio controls src={levelData?.audio} className="w-full h-8" />
                    </div>
                  )}

                  {selectedStep === 3 && (
                    <div className="text-center">
                      <p className="text-sm text-neutral-300 mb-2">{t.step3Instruction}</p>
                      <audio controls src={(levelData as any)?.sentenceAudios?.[0]} className="w-full h-8 mb-1.5" />
                      <span className="text-xs sm:text-sm text-neutral-400 font-medium">{t.sentenceCount}</span>
                    </div>
                  )}

                  {selectedStep === 4 && (
                    <div className="text-center">
                      <p className="text-sm text-neutral-300 mb-2">{t.step4Instruction}</p>
                      <audio controls src={(levelData as any)?.sentenceAudios?.[0]} className="w-full h-8 mb-1.5" />
                      <span className="text-xs sm:text-sm text-neutral-400 font-medium">{t.sentenceCount}</span>
                    </div>
                  )}

                  {selectedStep === 5 && (
                    <div className="text-center">
                      <p className="text-sm text-neutral-300 mb-2">{t.step5Instruction}</p>
                      <audio controls src={(levelData as any)?.sentenceAudios?.[0]} className="w-full h-8 mb-1.5" />
                      <span className="text-xs sm:text-sm text-neutral-400 font-medium">{t.sentenceCount}</span>
                    </div>
                  )}

                  {selectedStep === 6 && (
                    <div className="text-center">
                      <p className="text-sm text-neutral-300 mb-2">{t.step6Instruction}</p>
                      <audio controls src={(levelData as any)?.sentenceAudios?.[0]} className="w-full h-8 mb-1.5" />
                      <span className="text-xs sm:text-sm text-neutral-400 font-medium">{t.sentenceCount}</span>
                    </div>
                  )}

                  {selectedStep === 7 && (
                    <div className="flex flex-col items-center text-center gap-1">
                      <p className="text-sm text-neutral-300">{t.step7Instruction}</p>
                      <span className="text-xs sm:text-sm text-neutral-400 font-medium">{t.sentenceCount}</span>
                      <span className="text-xs text-neutral-500 font-mono mt-0.5">{t.step7NoAudio}</span>
                    </div>
                  )}

                  {selectedStep === 8 && (
                    <div className="text-center">
                      <p className="text-sm text-neutral-300 mb-2">{t.step8Instruction}</p>
                      <audio controls src={levelData?.audio} className="w-full h-8" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ÁREA INFERIOR */}
            <div className="flex-1 flex flex-col justify-between min-h-0">
              {/* PASSO 1 */}
              {selectedStep === 1 && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                    <p className="text-base font-semibold text-neutral-200 mb-2.5 text-center">
                      {t.step1Question}
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
                              : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStep(2)}
                    className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                  >
                    {t.step1Btn}
                  </button>
                </div>
              )}

              {/* PASSO 2 */}
              {selectedStep === 2 && (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 text-sm sm:text-base text-neutral-300 leading-relaxed mb-3 text-justify">
                      {sentences.map((sent: string, sIdx: number) => {
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2">
                      {gapsData.map((gap: any, gIdx: number) => (
                        <div key={gIdx} className="p-2.5 bg-neutral-950 rounded-lg border border-neutral-800">
                          <span className="text-xs font-semibold text-neutral-400 block mb-1.5 text-center uppercase tracking-wider">
                            {t.step2GapLabel(gIdx + 1)}
                          </span>
                          <div className="flex gap-1.5">
                            {gap.options.map((opt: string, oIdx: number) => (
                              <button
                                key={oIdx}
                                onClick={() => setGapAnswers((prev) => ({ ...prev, [gIdx]: opt }))}
                                className={`flex-1 py-1.5 rounded text-sm font-medium border transition ${
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
                    onClick={() => setSelectedStep(3)}
                    className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                  >
                    {t.step2Btn}
                  </button>
                </div>
              )}

              {/* PASSO 3 */}
              {selectedStep === 3 && (
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="min-h-14 p-3 bg-neutral-950 border border-dashed border-neutral-700 rounded-xl flex flex-wrap gap-2 items-center justify-center mb-3">
                      {selectedSlots.length === 0 ? (
                        <span className="text-sm text-neutral-500">{t.step3Prompt}</span>
                      ) : (
                        selectedSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlots((prev) => prev.filter((s) => s.id !== slot.id))}
                            className="px-3 py-1.5 bg-blue-600 border border-blue-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600 hover:border-rose-500 transition shadow-sm"
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
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
                              isSelected
                                ? 'border-dashed border-neutral-800/80 bg-neutral-950/40 text-transparent select-none pointer-events-none cursor-default'
                                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:border-neutral-600'
                            }`}
                          >
                            {slot.text}
                          </button>
                        );
                      })}
                    </div>

                    {orderFeedback && (
                      <p className={`text-sm font-semibold mb-2 text-center ${orderFeedback === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {orderFeedback === 'correct' ? t.step3Correct : t.step3Wrong}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={checkOrder} className="w-1/2 py-2.5 bg-neutral-800 hover:bg-neutral-700 font-semibold rounded-xl text-sm transition">
                      {t.step3CheckBtn}
                    </button>
                    <button
                      onClick={() => setSelectedStep(4)}
                      className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                    >
                      {t.step3NextBtn}
                    </button>
                  </div>
                </div>
              )}

              {/* PASSO 4 */}
              {selectedStep === 4 && (
                <div className="flex-1 flex flex-col justify-between">
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
                      placeholder={t.step4Placeholder}
                      rows={2}
                      className={`w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm sm:text-base focus:outline-none focus:border-blue-500 mb-2 resize-none ${
                        isTypingLocked ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    />

                    {typingFeedback && (
                      <div className="mb-2 text-center">
                        {typingFeedback === 'correct' ? (
                          <p className="text-sm font-semibold text-emerald-400">{t.step4Correct}</p>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl w-full text-center">
                              <span className="text-sm font-semibold text-rose-400 block mb-1.5">{t.step4Wrong}</span>
                              <div className="text-sm text-neutral-200">
                                <span className="text-xs text-neutral-400 uppercase tracking-wider block mb-0.5">
                                  {t.step4CorrectSentenceLabel}
                                </span>
                                <p className="font-medium text-white italic">"{currentSentence}"</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIsTypingLocked(false);
                                setTypingFeedback(null);
                              }}
                              className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm font-medium transition"
                            >
                              {t.step4Retry}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={checkTyping} className="w-1/2 py-2.5 bg-neutral-800 hover:bg-neutral-700 font-semibold rounded-xl text-sm transition">
                      {t.step4CheckBtn}
                    </button>
                    <button
                      onClick={() => setSelectedStep(5)}
                      className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                    >
                      {t.step4NextBtn}
                    </button>
                  </div>
                </div>
              )}

              {/* PASSO 5 */}
              {selectedStep === 5 && (
                <div className="flex-1 flex flex-col justify-between text-center">
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-base sm:text-lg font-medium text-neutral-200 my-auto">
                    "{currentSentence}"
                  </div>
                  <button
                    onClick={() => setSelectedStep(6)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                  >
                    {t.nextSentenceBtn}
                  </button>
                </div>
              )}

              {/* PASSO 6 */}
              {selectedStep === 6 && (
                <div className="flex-1 flex flex-col justify-between text-center">
                  <div className="p-6 bg-neutral-950/60 border border-dashed border-neutral-800 rounded-xl my-auto flex flex-col items-center justify-center">
                    <span className="text-3xl mb-1.5">🎧</span>
                    <span className="text-sm text-neutral-500 font-medium">{t.step6Hidden}</span>
                  </div>
                  <button
                    onClick={() => setSelectedStep(7)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                  >
                    {t.nextSentenceBtn}
                  </button>
                </div>
              )}

              {/* PASSO 7 */}
              {selectedStep === 7 && (
                <div className="flex-1 flex flex-col justify-between text-center">
                  <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-base sm:text-lg font-medium text-neutral-200 my-auto">
                    "{currentSentence}"
                  </div>
                  <button
                    onClick={() => setSelectedStep(8)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                  >
                    {t.nextSentenceBtn}
                  </button>
                </div>
              )}

              {/* PASSO 8 */}
              {selectedStep === 8 && (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-200 leading-relaxed text-sm sm:text-base mb-3 text-justify">
                    {levelData?.fullText}
                  </div>
                  <button
                    onClick={() => setSelectedStep(1)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl text-sm transition"
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
