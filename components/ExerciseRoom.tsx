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

  // Estados do Exercício 3 (Arrastar/Ordenar palavras)
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [orderFeedback, setOrderFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Estados do Exercício 4 (Digitação)
  const [typedInput, setTypedInput] = useState<string>('');
  const [typingFeedback, setTypingFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isTypingLocked, setIsTypingLocked] = useState<boolean>(false);

  const currentLevelData = lessonData.levels[level];
  const currentSentence = currentLevelData.sentences[sentenceIndex] || '';

  // Velocidades calibradas: A1/A2 = 0.8 | B1/B2 = 0.85 | C1/C2 = 0.9
  const speedMap: Record<LevelKey, number> = {
    A1: 0.8,
    A2: 0.8,
    B1: 0.85,
    B2: 0.85,
    C1: 0.9,
    C2: 0.9,
  };

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
      setAvailableWords([...cleanWords].sort(() => Math.random() - 0.5));
      setSelectedWords([]);
      setOrderFeedback(null);
    }
  }, [step, sentenceIndex, currentSentence]);

  useEffect(() => {
    if (step === 4) {
      setTypedInput('');
      setTypingFeedback(null);
      setIsTypingLocked(false);
    }
  }, [step, sentenceIndex]);

  const handleWordClick = (word: string, fromAvailable: boolean) => {
    if (orderFeedback === 'correct') return;
    if (fromAvailable) {
      const idx = availableWords.indexOf(word);
      const updated = [...availableWords];
      updated.splice(idx, 1);
      setAvailableWords(updated);
      setSelectedWords([...selectedWords, word]);
    } else {
      const idx = selectedWords.indexOf(word);
      const updated = [...selectedWords];
      updated.splice(idx, 1);
      setSelectedWords(updated);
      setAvailableWords([...availableWords, word]);
    }
  };

  const checkOrder = () => {
    const rawSentence = currentSentence.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').toLowerCase();
    const constructed = selectedWords.join(' ').toLowerCase();
    if (rawSentence === constructed) {
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
    if (sentenceIndex + 1 < currentLevelData.sentences.length) {
      setSentenceIndex(sentenceIndex + 1);
    } else {
      setSentenceIndex(0);
      setStep((prev) => Math.min(prev + 1, 6));
    }
  };

  return (
    <main className="h-screen max-h-screen bg-neutral-950 text-neutral-100 flex flex-col p-3 sm:p-5 font-sans overflow-hidden">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col min-h-0">
        
        {/* LINHA 1: Nome da página (ReadingHub) e Nível Estático */}
        <header className="flex items-center justify-between pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href={`/level/${level}`}
              className="text-xs text-neutral-400 hover:text-white transition flex items-center gap-1"
            >
              ← Textos
            </Link>
            <span className="text-neutral-600">|</span>
            <h1 className="text-lg font-bold tracking-tight text-white">ReadingHub</h1>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">Nível:</span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white">
              {level}
            </span>
          </div>
        </header>

        {/* LINHA 2: Título do Texto */}
        <div className="pb-2.5 shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-200 truncate">
            {lessonData.title}
          </h2>
        </div>

        {/* LINHA 3 ATÉ O BOTTOM: Card de tamanho fixo com rolagem interna */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-sm flex-1 min-h-0 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Indicador de Etapas */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-neutral-400 mb-2">
                <span>Etapa {step} de 6</span>
                <span className="font-medium text-neutral-300">
                  {step === 1 && '1. Escuta Global (Input Cego)'}
                  {step === 2 && '2. Leitura com Áudio (Decodificação)'}
                  {step === 3 && '3. Reconstrução Sintática'}
                  {step === 4 && '4. Ditado & Digitação'}
                  {step === 5 && '5. Repetição Oral'}
                  {step === 6 && '6. Shadowing Mental & Autonomia'}
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${(step / 6) * 100}%` }}
                />
              </div>
            </div>

            {/* ETAPA 1: Escuta Global */}
            {step === 1 && (
              <div className="flex flex-col items-center text-center">
                <img
                  src={lessonData.image}
                  alt={lessonData.title}
                  className="w-full h-44 sm:h-52 object-cover rounded-xl mb-4"
                />
                <h3 className="text-lg font-bold mb-2">{lessonData.title}</h3>
                <p className="text-sm text-neutral-400 mb-5">
                  Ouça o áudio completo atentamente sem tentar ler nenhum texto. Concentre-se no ritmo e no sentido geral.
                </p>
                <audio
                  key={`${level}-${step}`}
                  controls
                  src={currentLevelData.audio}
                  className="w-full mb-5"
                >
                  Seu navegador não suporta áudio.
                </audio>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                >
                  Próxima Etapa: Leitura Guiada
                </button>
              </div>
            )}

            {/* ETAPA 2: Leitura Guiada */}
            {step === 2 && (
              <div>
                <audio
                  key={`${level}-${step}`}
                  controls
                  src={currentLevelData.audio}
                  className="w-full mb-5"
                >
                  Seu navegador não suporta áudio.
                </audio>
                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-200 leading-relaxed text-base mb-6">
                  {currentLevelData.fullText}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 bg-neutral-800 hover:bg-neutral-700 font-semibold rounded-xl text-sm text-neutral-300 transition"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => {
                      setSentenceIndex(0);
                      setStep(3);
                    }}
                    className="w-2/3 py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                  >
                    Iniciar Exercícios
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 3: Montar a Frase */}
            {step === 3 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-neutral-400">
                    Frase {sentenceIndex + 1} de {currentLevelData.sentences.length}
                  </span>
                  <button
                    onClick={() => speakSentence(currentSentence)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-blue-400 text-xs rounded-full font-medium transition"
                  >
                    Ouvir Frase 🔊
                  </button>
                </div>

                <div className="min-h-16 p-3 bg-neutral-950 border border-dashed border-neutral-700 rounded-xl flex flex-wrap gap-2 items-center mb-4">
                  {selectedWords.length === 0 ? (
                    <span className="text-xs text-neutral-500">Toque nas palavras abaixo para ordenar...</span>
                  ) : (
                    selectedWords.map((word, i) => (
                      <button
                        key={i}
                        onClick={() => handleWordClick(word, false)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  {availableWords.map((word, i) => (
                    <button
                      key={i}
                      onClick={() => handleWordClick(word, true)}
                      className="px-3 py-1.5 bg-neutral-800 text-neutral-300 text-sm rounded-lg hover:bg-neutral-700 transition"
                    >
                      {word}
                    </button>
                  ))}
                </div>

                {orderFeedback && (
                  <p
                    className={`text-xs font-semibold mb-4 ${
                      orderFeedback === 'correct' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {orderFeedback === 'correct' ? 'Excelente! Ordem correta.' : 'Incorreto. Tente reorganizar.'}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={checkOrder}
                    className="w-1/2 py-2.5 bg-neutral-800 hover:bg-neutral-700 font-semibold rounded-xl text-sm transition"
                  >
                    Checar
                  </button>
                  <button
                    onClick={nextSentenceOrStep}
                    disabled={orderFeedback !== 'correct'}
                    className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-xl text-sm transition"
                  >
                    Avançar
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 4: Digitação */}
            {step === 4 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-neutral-400">
                    Frase {sentenceIndex + 1} de {currentLevelData.sentences.length}
                  </span>
                  <button
                    onClick={() => speakSentence(currentSentence)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-blue-400 text-xs rounded-full font-medium transition"
                  >
                    Ouvir Trecho 🔊
                  </button>
                </div>

                <p className="text-xs text-neutral-400 mb-3">
                  Escute o áudio da frase e digite exatamente o que ouviu:
                </p>

                <textarea
                  value={typedInput}
                  disabled={isTypingLocked}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder="Digite a frase aqui..."
                  rows={3}
                  className={`w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 mb-3 resize-none ${
                    isTypingLocked ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                />

                {typingFeedback && (
                  <div className="mb-4">
                    {typingFeedback === 'correct' ? (
                      <p className="text-xs font-semibold text-emerald-400">Muito bem! Frase digitada corretamente.</p>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-rose-400 mb-1">Diferente do esperado.</p>
                        <p className="text-xs text-neutral-400 mb-2">
                          Esperado: <span className="text-neutral-200">{currentSentence}</span>
                        </p>
                        <button
                          type="button"
                          onClick={handleRetryTyping}
                          className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition"
                        >
                          Tentar de novo
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={checkTyping}
                    disabled={isTypingLocked && typingFeedback === 'wrong'}
                    className="w-1/2 py-2.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-xl text-sm transition"
                  >
                    Checar Digitação
                  </button>
                  <button
                    onClick={nextSentenceOrStep}
                    disabled={typingFeedback !== 'correct'}
                    className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-xl text-sm transition"
                  >
                    Avançar
                  </button>
                </div>
              </div>
            )}

            {/* ETAPA 5: Repetição Oral */}
            {step === 5 && (
              <div className="text-center">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs text-neutral-400">
                    Frase {sentenceIndex + 1} de {currentLevelData.sentences.length}
                  </span>
                  <button
                    onClick={() => speakSentence(currentSentence)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-blue-400 text-xs rounded-full font-medium transition"
                  >
                    Ouvir Modelo 🔊
                  </button>
                </div>

                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-base font-medium text-neutral-200 mb-6">
                  "{currentSentence}"
                </div>

                <p className="text-xs text-neutral-400 mb-6">
                  Escute o modelo com atenção e repita a frase em voz alta 2 a 3 vezes, focando no ritmo e na entonação.
                </p>

                <button
                  onClick={nextSentenceOrStep}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                >
                  Próxima Frase
                </button>
              </div>
            )}

            {/* ETAPA 6: Shadowing Mental e Leitura Solo */}
            {step === 6 && (
              <div>
                <h3 className="text-lg font-bold mb-2">Consolidação e Autonomia</h3>
                <div className="p-3.5 bg-neutral-950 border border-blue-900/40 rounded-xl text-xs text-neutral-300 mb-4 leading-relaxed">
                  <strong className="text-blue-400">Orientações Finais:</strong>
                  <ol className="list-decimal ml-4 mt-1 space-y-1">
                    <li>Dê o play no áudio abaixo e faça <strong>shadowing mental</strong>.</li>
                    <li>Em seguida, faça a <strong>leitura do texto completo em voz alta sozinho</strong>.</li>
                  </ol>
                </div>

                <audio
                  key={`${level}-${step}`}
                  controls
                  src={currentLevelData.audio}
                  className="w-full mb-4"
                >
                  Seu navegador não suporta áudio.
                </audio>

                <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-200 leading-relaxed text-base mb-5">
                  {currentLevelData.fullText}
                </div>

                <button
                  onClick={() => {
                    setStep(1);
                    setSentenceIndex(0);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl text-sm transition"
                >
                  Concluir e Voltar ao Início
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}