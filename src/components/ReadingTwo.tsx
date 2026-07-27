import React, { useState } from 'react';
import { Volume2, CheckCircle, XCircle } from 'lucide-react';
import { EnglishLevel, VocabularyItem } from '../types';

interface ReadingTwoProps {
  readingText: string;
  translationText: string | null;
  vocabulary: VocabularyItem[];
  answers: string[] | null;
  topicName: string | null;
  level: EnglishLevel;
  showTranslation: boolean;
  audioUrl: string | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  isAudioLoading: boolean;
  setIsPlaying: (playing: boolean) => void;
  handlePlayAudio: () => Promise<void>;
}

export const ReadingTwo: React.FC<ReadingTwoProps> = ({
  readingText,
  translationText,
  vocabulary,
  answers,
  topicName,
  level,
  showTranslation,
  audioUrl,
  audioRef,
  isPlaying,
  isAudioLoading,
  setIsPlaying,
  handlePlayAudio
}) => {
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (index: number, value: string) => {
    setUserInputs(prev => ({ ...prev, [index]: value }));
  };

  const checkAnswers = () => {
    setIsSubmitted(true);
  };

  // Parse text like "Some text (1) more text (2)." into parts
  // We look for "(1)", "(2)", etc.
  const parts = readingText.split(/(\(\d+\))/g);

  return (
    <div className="bg-white rounded-[2rem] shadow-xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden border-[6px] border-brand-blue-dark">
      <div className="flex items-center justify-between">
        <h3 className="text-xl sm:text-2xl font-black text-brand-blue uppercase tracking-widest">
          Reading 2 (Fill in the blanks)
        </h3>
        
        {audioUrl && (
          <button
            onClick={handlePlayAudio}
            disabled={isAudioLoading}
            className="flex items-center gap-2 px-4 py-2 bg-brand-gold hover:bg-yellow-400 text-brand-blue-dark font-black rounded-xl transition-all disabled:opacity-50"
          >
            <Volume2 size={20} />
            {isPlaying ? 'Dừng' : (isAudioLoading ? 'Đang tải...' : 'Nghe')}
          </button>
        )}
      </div>

      <div className="text-sm sm:text-base font-medium text-slate-700 leading-loose">
        {parts.map((part, i) => {
          const match = part.match(/^\((\d+)\)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            const index = num - 1; // zero based
            const expectedAns = answers?.[index]?.toLowerCase() || '';
            const userAns = (userInputs[num] || '').toLowerCase().trim();
            const isCorrect = userAns === expectedAns;

            return (
              <span key={i} className="inline-flex flex-col items-center mx-1 relative top-2">
                <input
                  type="text"
                  value={userInputs[num] || ''}
                  onChange={(e) => handleInputChange(num, e.target.value)}
                  disabled={isSubmitted}
                  className={`w-24 sm:w-32 border-b-2 bg-slate-50 text-center font-bold px-2 py-1 outline-none transition-colors ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-green-500 text-green-700 bg-green-50'
                        : 'border-red-500 text-red-700 bg-red-50'
                      : 'border-slate-300 focus:border-brand-blue text-brand-blue-dark focus:bg-white'
                  }`}
                  placeholder={`(${num})`}
                />
                {isSubmitted && !isCorrect && answers && answers[index] && (
                  <span className="text-xs font-black text-green-600 mt-1">
                    {answers[index]}
                  </span>
                )}
              </span>
            );
          }
          // Normal text part
          return <span key={i}>{part}</span>;
        })}
      </div>

      {!isSubmitted ? (
        <button
          onClick={checkAnswers}
          className="mt-4 px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white font-black rounded-xl uppercase tracking-widest transition-all self-center shadow-lg"
        >
          Kiểm tra / Trả lời
        </button>
      ) : (
        <div className="mt-4 p-4 bg-slate-100 rounded-xl space-y-2 text-sm">
          <h4 className="font-black text-slate-700 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            Gợi ý trả lời & Dịch nghĩa
          </h4>
          <p className="font-bold text-slate-800">
            {answers?.map((ans, idx) => `(${idx + 1}) ${ans}`).join(' • ')}
          </p>
          {showTranslation && translationText && (
            <p className="mt-4 text-slate-600 italic">
              {translationText}
            </p>
          )}
          <button 
            onClick={() => { setIsSubmitted(false); setUserInputs({}); }}
            className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors text-xs"
          >
            Làm lại
          </button>
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      )}
    </div>
  );
};
