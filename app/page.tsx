'use client';

import { useState, useEffect } from 'react';
import lessonData from '../data/lessons/01-coffee-culture.json';

type LevelKey = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export default function Home() {
  const [level, setLevel] = useState<LevelKey>('A1');
  const [step, setStep] = useState<number>(1);
  const [sentenceIndex, setSentenceIndex] = useState<number>(0);

  // Estados do Exercício 3 (Arrastar/Ordenar palavras)
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [orderFeedback, setOrderFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Estados do Exercício 4 (Digitação)
  const [typedInput, setTypedInput] = useState<string>('');
  const [typingFeedback, setTypingFeedback] = useState<'correct' | 'wrong' | null>(null);

  const currentLevelData = lessonData.levels[level];
  const currentSentence = currentLevelData.sentences[sentenceIndex] || '';

  // Síntese de voz para as etapas isoladas (3, 4 e 5)
  const speakSentence = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = level === 'A1' || level === 'A2' ? 0.85 : 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Prepara as palavras do exercício 3 ao mudar de frase
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

  // Limpa estados ao trocar de etapa ou frase no exercício 4
  useEffect(() => {
    if (step === 4) {
      setTypedInput('');
      setTypingFeedback(null);
    }
  }, [step, sentenceIndex]);

  // Ação ao trocar de nível
  const handleLevelChange = (lvl: LevelKey) => {
    setLevel(lvl);
    setStep(1);
    setSentenceIndex(0);
  };

  // Validação do exercício 3
  const handleWordClick = (word: string, fromAvailable: boolean) => {
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

  // Validação do exercício 4
  const checkTyping = () => {
    const cleanOriginal = currentSentence.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toLowerCase();
    const cleanTyped = typedInput.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').trim().toLowerCase();
    if (cleanOriginal === cleanTyped) {
      setTypingFeedback('correct');
    } else {
      setTypingFeedback('wrong');
    }
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
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header / Seletor de Nível */}
        <header className="mb-6 pb-4 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold tracking-tight text-white">ReadingHub</h1>
            <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded">
              {lessonData.title}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as LevelKey[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  level === lvl
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </header>

        {/* Indicador de Etapas */}
        <div className="mb-6">
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

        {/* Conteúdo da Etapa */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-6 shadow-sm">
          {/* ETAPA 1: Escuta Global */}
          {step === 1 && (
            <div className="flex flex-col items-center text-center">
              <img
                src={lessonData.image}
                alt={lessonData.title}
                className="w-full h-48 sm:h-56 object-cover rounded-xl mb-4"
              />
              <h2 className="text-xl font-bold mb-2">{lessonData.title}</h2>
              <p className="text-sm text-neutral-400 mb-6">
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
              <h2 className="text-lg font-bold mb-3">{lessonData.title}</h2>
              <audio controls className="w-full mb-5">
                <source src={currentLevelData.audio} type="audio/mp3" />
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

              {/* Área de montagem */}
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

              {/* Palavras disponíveis */}
              <div className="flex flex-wrap gap-2 mb-6">
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
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
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
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder="Digite a frase aqui..."
                rows={3}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-500 mb-3 resize-none"
              />

              {typingFeedback && (
                <div className="mb-4">
                  {typingFeedback === 'correct' ? (
                    <p className="text-xs font-semibold text-emerald-400">Muito bem! Frase digitada corretamente.</p>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-rose-400 mb-1">Diferente do esperado.</p>
                      <p className="text-xs text-neutral-400">Esperado: <span className="text-neutral-200">{currentSentence}</span></p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={checkTyping}
                  className="w-1/2 py-2.5 bg-neutral-800 hover:bg-neutral-700 font-semibold rounded-xl text-sm transition"
                >
                  Checar Digitação
                </button>
                <button
                  onClick={nextSentenceOrStep}
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
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
              <h2 className="text-lg font-bold mb-2">Consolidação e Autonomia</h2>
              <div className="p-3.5 bg-neutral-950 border border-blue-900/40 rounded-xl text-xs text-neutral-300 mb-5 leading-relaxed">
                <strong className="text-blue-400">Orientações Finais:</strong>
                <ol className="list-decimal ml-4 mt-1 space-y-1">
                  <li>Dê o play no áudio abaixo e faça <strong>shadowing mental</strong> (reproduza a voz na cabeça, na mesma velocidade e ritmo).</li>
                  <li>Em seguida, faça a <strong>leitura do texto completo em voz alta sozinho</strong>.</li>
                </ol>
              </div>

              <audio controls className="w-full mb-5">
                <source src={currentLevelData.audio} type="audio/mp3" />
                Seu navegador não suporta áudio.
              </audio>

              <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-200 leading-relaxed text-base mb-6">
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

        {/* Patrocinador Discreto e Nativo */}
        <aside className="p-3 bg-neutral-900/70 border border-neutral-800/80 rounded-xl text-xs flex items-center justify-between">
          <span className="text-neutral-400">
            {lessonData.sponsor.text}
          </span>
          <a
            href={lessonData.sponsor.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline font-medium ml-2 shrink-0"
          >
            Saiba mais →
          </a>
        </aside>
      </div>
    </main>
  );
}