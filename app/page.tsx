'use client';

import React, { useState, useEffect } from 'react';
import lessonData from '../data/lessons/01-coffee-culture.json';

type LevelKey = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export default function Home() {
  const [level, setLevel] = useState<LevelKey>('A1');
  const [step, setStep] = useState<number>(1);

  // Estados dos exercícios
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number>(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [typedText, setTypedText] = useState<string>('');
  
  // Controle de validação e bloqueio
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isInputLocked, setIsInputLocked] = useState<boolean>(false);

  const currentLevelData = lessonData.levels[level];
  const sentences = currentLevelData.sentences || [];
  const currentSentence = sentences[currentSentenceIdx] || '';

  // Reset de estado ao trocar nível ou etapa
  useEffect(() => {
    setCurrentSentenceIdx(0);
    resetSentenceState();
  }, [level, step]);

  const resetSentenceState = () => {
    setSelectedWords([]);
    setTypedText('');
    setIsCorrect(false);
    setHasError(false);
    setIsInputLocked(false);
  };

  // Validação: Ordenar Palavras (Etapa 3)
  const handleWordClick = (word: string) => {
    if (isCorrect) return;
    setSelectedWords((prev) => [...prev, word]);
  };

  const handleRemoveWord = (index: number) => {
    if (isCorrect) return;
    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
  };

  const verifyOrder = () => {
    const formed = selectedWords.join(' ').trim().toLowerCase();
    const target = currentSentence.trim().toLowerCase();
    if (formed === target) {
      setIsCorrect(true);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  // Validação: Escrita (Etapa 4)
  const verifyTyping = () => {
    const typed = typedText.trim().toLowerCase();
    const target = currentSentence.trim().toLowerCase();

    if (typed === target) {
      setIsCorrect(true);
      setHasError(false);
      setIsInputLocked(true);
    } else {
      setHasError(true);
      setIsInputLocked(true); // Trava o campo para impedir edição sem reset
    }
  };

  const handleRetryTyping = () => {
    setIsInputLocked(false);
    setHasError(false);
  };

  // Avanço de Frase (Só permite se isCorrect for true)
  const handleNextSentence = () => {
    if (!isCorrect) return;
    if (currentSentenceIdx < sentences.length - 1) {
      setCurrentSentenceIdx((prev) => prev + 1);
      resetSentenceState();
    }
  };

  const isLastSentence = currentSentenceIdx === sentences.length - 1;
  const isExerciseFinished = isLastSentence && isCorrect;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl">
        {/* Cabeçalho */}
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-100">{lessonData.title}</h1>
          <p className="text-sm text-neutral-400 mt-1">ReadingHub • Prática Guiada</p>
        </header>

        {/* Seletor de Níveis */}
        <div className="flex justify-center gap-2 mb-6">
          {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as LevelKey[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                level === lvl
                  ? 'bg-neutral-100 text-neutral-950'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Navegador de Etapas */}
        <div className="grid grid-cols-6 gap-1 bg-neutral-900 p-1.5 rounded-xl mb-6">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`py-1.5 rounded-lg text-xs font-medium transition ${
                step === s
                  ? 'bg-neutral-800 text-neutral-100 font-bold'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Passo {s}
            </button>
          ))}
        </div>

        {/* Container Principal */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          {/* ETAPA 1: Listening */}
          {step === 1 && (
            <div>
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Etapa 1: Escuta Atenta</span>
              <p className="text-sm text-neutral-400 mt-1 mb-5">Ouça o áudio completo sem ler o texto.</p>
              <audio key={`${level}-1`} controls src={currentLevelData.audio} className="w-full mb-4">
                Seu navegador não suporta áudio.
              </audio>
            </div>
          )}

          {/* ETAPA 2: Leitura + Áudio */}
          {step === 2 && (
            <div>
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Etapa 2: Leitura e Escuta</span>
              <audio key={`${level}-2`} controls src={currentLevelData.audio} className="w-full my-4">
                Seu navegador não suporta áudio.
              </audio>
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-200 leading-relaxed text-base">
                {currentLevelData.fullText}
              </div>
            </div>
          )}

          {/* ETAPA 3: Sintaxe / Ordenar Palavras */}
          {step === 3 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Etapa 3: Sintaxe</span>
                <span className="text-xs text-neutral-500 font-mono">
                  {currentSentenceIdx + 1} / {sentences.length}
                </span>
              </div>
              <p className="text-sm text-neutral-400 mb-4">Organize as palavras na ordem correta:</p>

              {/* Área de montagem */}
              <div className="min-h-[56px] p-3 bg-neutral-950 border border-neutral-800 rounded-xl mb-4 flex flex-wrap gap-2 items-center">
                {selectedWords.length === 0 && (
                  <span className="text-neutral-600 text-sm">Clique nas palavras abaixo...</span>
                )}
                {selectedWords.map((word, i) => (
                  <button
                    key={i}
                    disabled={isCorrect}
                    onClick={() => handleRemoveWord(i)}
                    className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 hover:bg-neutral-700"
                  >
                    {word}
                  </button>
                ))}
              </div>

              {/* Banco de palavras */}
              <div className="flex flex-wrap gap-2 mb-5">
                {currentSentence
                  .split(' ')
                  .sort()
                  .map((word, i) => (
                    <button
                      key={i}
                      disabled={isCorrect}
                      onClick={() => handleWordClick(word)}
                      className="px-3 py-1.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-600 rounded-lg text-sm text-neutral-300 transition"
                    >
                      {word}
                    </button>
                  ))}
              </div>

              {/* Feedback e Botões */}
              <div className="flex items-center gap-3">
                {!isCorrect && (
                  <button
                    onClick={verifyOrder}
                    className="px-4 py-2 bg-neutral-100 text-neutral-950 font-semibold text-sm rounded-lg hover:bg-neutral-200 transition"
                  >
                    Verificar
                  </button>
                )}

                {hasError && <span className="text-red-400 text-sm font-medium">Ordem incorreta. Tente novamente.</span>}
                {isCorrect && <span className="text-green-400 text-sm font-medium">Correto!</span>}

                {/* Avanço estritamente condicionado ao acerto */}
                {isCorrect && !isLastSentence && (
                  <button
                    onClick={handleNextSentence}
                    className="ml-auto px-4 py-2 bg-neutral-800 text-neutral-100 font-semibold text-sm rounded-lg hover:bg-neutral-700"
                  >
                    Próxima Frase →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ETAPA 4: Escrita / Ditado */}
          {step === 4 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Etapa 4: Escrita</span>
                <span className="text-xs text-neutral-500 font-mono">
                  {currentSentenceIdx + 1} / {sentences.length}
                </span>
              </div>
              <p className="text-sm text-neutral-400 mb-3">Digite a frase exata correspondente:</p>

              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-sm text-neutral-400 mb-4 italic">
                Alvo: "{currentSentence}"
              </div>

              {/* Input com trava mecânica */}
              <input
                type="text"
                disabled={isInputLocked}
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isInputLocked) verifyTyping();
                }}
                placeholder="Digite a frase aqui..."
                className={`w-full p-3 rounded-xl bg-neutral-950 border text-sm transition outline-none mb-4 ${
                  hasError
                    ? 'border-red-500 text-red-300'
                    : isCorrect
                    ? 'border-green-500 text-green-300'
                    : 'border-neutral-800 focus:border-neutral-600 text-neutral-100'
                } ${isInputLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
              />

              <div className="flex items-center gap-3">
                {!isCorrect && !hasError && (
                  <button
                    onClick={verifyTyping}
                    className="px-4 py-2 bg-neutral-100 text-neutral-950 font-semibold text-sm rounded-lg hover:bg-neutral-200 transition"
                  >
                    Verificar
                  </button>
                )}

                {/* Exibição quando diferente do esperado com botão obrigatório para destravar */}
                {hasError && (
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 text-sm font-medium">Diferente do esperado</span>
                    <button
                      onClick={handleRetryTyping}
                      className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 rounded-lg transition"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}

                {isCorrect && <span className="text-green-400 text-sm font-medium">Perfeito!</span>}

                {/* Avanço bloqueado até o acerto */}
                {isCorrect && !isLastSentence && (
                  <button
                    onClick={handleNextSentence}
                    className="ml-auto px-4 py-2 bg-neutral-800 text-neutral-100 font-semibold text-sm rounded-lg hover:bg-neutral-700"
                  >
                    Próxima Frase →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ETAPA 5: Repetição / Fala */}
          {step === 5 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Etapa 5: Fala e Repetição</span>
                <span className="text-xs text-neutral-500 font-mono">
                  {currentSentenceIdx + 1} / {sentences.length}
                </span>
              </div>
              <p className="text-sm text-neutral-400 mb-4">Leia a frase em voz alta praticando a pronúncia:</p>

              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-lg text-neutral-100 mb-5 font-medium">
                "{currentSentence}"
              </div>

              <div className="flex items-center gap-3">
                {!isCorrect ? (
                  <button
                    onClick={() => setIsCorrect(true)}
                    className="px-4 py-2 bg-neutral-100 text-neutral-950 font-semibold text-sm rounded-lg hover:bg-neutral-200 transition"
                  >
                    Concluir Leitura
                  </button>
                ) : (
                  <span className="text-green-400 text-sm font-medium">Concluído!</span>
                )}

                {/* Avanço liberado apenas após confirmação */}
                {isCorrect && !isLastSentence && (
                  <button
                    onClick={handleNextSentence}
                    className="ml-auto px-4 py-2 bg-neutral-800 text-neutral-100 font-semibold text-sm rounded-lg hover:bg-neutral-700"
                  >
                    Próxima Frase →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ETAPA 6: Síntese Final */}
          {step === 6 && (
            <div>
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Etapa 6: Síntese e Fixação</span>
              <p className="text-sm text-neutral-400 mt-1 mb-4">Ouça mais uma vez acompanhando o texto mentalmente.</p>
              <audio key={`${level}-6`} controls src={currentLevelData.audio} className="w-full mb-4">
                Seu navegador não suporta áudio.
              </audio>
              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-300 leading-relaxed text-sm">
                {currentLevelData.fullText}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Navegação Entre Etapas */}
        <footer className="flex justify-between items-center mt-6">
          <button
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-neutral-900 border border-neutral-800 text-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-neutral-200"
          >
            ← Etapa Anterior
          </button>

          {/* Só permite pular de etapa nos exercícios se tiver terminado as frases com sucesso */}
          <button
            disabled={step === 6 || ([3, 4, 5].includes(step) && !isExerciseFinished)}
            onClick={() => setStep((s) => Math.min(6, s + 1))}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-neutral-100 text-neutral-950 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-200 transition"
          >
            Próxima Etapa →
          </button>
        </footer>
      </div>
    </main>
  );
}