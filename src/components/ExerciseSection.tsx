import React, { useState, useEffect } from 'react';
import { ExerciseData, SpeakingQuestion } from '../types';
import { Mic, Square, CheckCircle, X, RefreshCw, AlertCircle, Award } from 'lucide-react';
import { useQuestionRecorder } from '../hooks/useQuestionRecorder';
import { motion } from 'motion/react';

interface ExerciseSectionProps {
  exerciseData: ExerciseData;
  onComplete: (score: number) => void;
  savedScore?: number | null;
}

interface SpeakingQuestionItemProps {
  question: SpeakingQuestion;
  index: number;
  onResult: (score: number, isCorrect: boolean) => void;
}

const SpeakingQuestionItem: React.FC<SpeakingQuestionItemProps> = ({ 
  question, 
  index,
  onResult
}) => {
  const { isRecording, isEvaluating, result, error, startRecording, stopRecording } = useQuestionRecorder(
    question.questionText,
    question.expectedAnswer,
    "A1" // generic level for now since prompt mainly relies on question/answer matching
  );

  useEffect(() => {
    if (result) {
      onResult(result.score, result.isCorrect);
    }
  }, [result]);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border-2 border-blue-100 shadow-sm mb-4">
      <h4 className="font-bold text-base sm:text-lg text-blue-900 mb-2">Câu {index + 1}: {question.questionText}</h4>
      <p className="text-sm text-gray-500 mb-4 italic font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">Gợi ý trả lời: {question.expectedAnswer}</p>

      <div className="flex items-center gap-4">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            disabled={isEvaluating}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white transition-all
              ${isEvaluating ? 'bg-gray-300' : 'bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg active:scale-95'}`}
          >
            {isEvaluating ? <RefreshCw className="animate-spin" size={20} /> : <Mic size={20} />}
            {isEvaluating ? 'Đang chấm điểm...' : 'Bấm để trả lời'}
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-900 shadow-md active:scale-95 text-white rounded-xl font-bold transition-all animate-pulse border-2 border-red-500/50"
          >
            <Square size={20} className="fill-current text-red-500" /> Dừng thu âm
          </button>
        )}
        {isRecording && <span className="text-sm font-bold text-red-500 animate-pulse">Đang nghe...</span>}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start gap-2 text-sm font-medium border border-red-100">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-4 sm:p-5 rounded-xl border-2 bg-blue-50/50 border-blue-100">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 bg-white w-fit px-3 py-1.5 rounded-lg shadow-sm">
                {result.isCorrect ? <CheckCircle className="text-green-600" size={18} /> : <X className="text-red-500" size={18} />}
                <span className={`font-black text-sm ${result.isCorrect ? 'text-green-700' : 'text-red-600'}`}>
                  {result.isCorrect ? 'Tuyệt vời! Bạn đã trả lời đúng ý.' : 'Chưa chính xác lắm, hãy thử lại nhé.'}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 leading-relaxed bg-white p-3 rounded-lg border border-gray-100 shadow-sm"><strong>🎙️ Bạn nói:</strong> "{result.transcribedText}"</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-blue-100/50 p-3 rounded-lg border border-blue-100"><strong>👩‍🏫 Nhận xét:</strong> {result.feedback}</p>
            </div>
            <div className="flex flex-col items-center justify-center w-full sm:w-auto p-4 bg-white rounded-xl shadow-sm border-2 border-indigo-50 sm:min-w-[100px]">
              <span className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-1">Điểm</span>
              <span className={`text-3xl font-black ${result.score >= 8 ? 'text-green-500' : result.score >= 5 ? 'text-yellow-500' : 'text-red-500'}`}>
                {result.score}<span className="text-lg text-gray-300">/10</span>
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export const ExerciseSection: React.FC<ExerciseSectionProps> = ({ exerciseData, onComplete, savedScore }) => {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [correctAnswers, setCorrectAnswers] = useState<Record<number, boolean>>({});

  const handleResult = (index: number, score: number, isCorrect: boolean) => {
    setScores(prev => ({ ...prev, [index]: score }));
    setCorrectAnswers(prev => ({ ...prev, [index]: isCorrect }));
  };

  const isAllAnswered = (exerciseData.speakingQuestions?.length || 0) > 0 && 
    Object.keys(scores).length === (exerciseData.speakingQuestions?.length || 0);

  const totalScore = isAllAnswered 
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / (exerciseData.speakingQuestions?.length || 1))
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mt-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-20"><Mic size={150} /></div>
        <h3 className="text-2xl sm:text-3xl font-black flex items-center gap-3 relative z-10">
          Luyện Nói - Trả Lời Câu Hỏi
        </h3>
        <p className="text-blue-100 mt-3 font-medium text-sm sm:text-base max-w-lg relative z-10">
          Hãy đọc câu hỏi, suy nghĩ câu trả lời và bấm nút Micro để ghi âm câu trả lời của bạn nhé! Ms Trang sẽ chấm điểm và nhận xét cho bạn.
        </p>
      </div>

      <div className="space-y-4">
        {exerciseData.speakingQuestions?.map((q, idx) => (
          <SpeakingQuestionItem 
            key={q.id || idx} 
            question={q} 
            index={idx} 
            onResult={(s, c) => handleResult(idx, s, c)} 
          />
        ))}
        {(!exerciseData.speakingQuestions || exerciseData.speakingQuestions.length === 0) && (
          <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            Không có câu hỏi nào trong bài học này.
          </div>
        )}
      </div>

      {isAllAnswered && totalScore !== null && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 sm:p-10 bg-green-50 border-4 border-green-200 rounded-[2rem] text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-10 right-10 p-4 opacity-10"><Award size={150} className="text-green-500" /></div>
          <h4 className="text-xl sm:text-2xl font-black text-green-800 mb-2 uppercase tracking-wide relative z-10">Bạn Đã Hoàn Thành Trả Lời Câu Hỏi!</h4>
          <p className="text-gray-600 font-medium mb-6 relative z-10">Điểm trung bình kỹ năng nói của bạn</p>
          <div className="text-5xl sm:text-7xl font-black text-green-600 mb-8 drop-shadow-sm relative z-10">{totalScore} <span className="text-3xl sm:text-4xl text-green-400">/ 10</span></div>
          <button 
            onClick={() => onComplete(totalScore)}
            className="relative z-10 px-8 py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black rounded-xl shadow-xl hover:shadow-2xl transition-all active:scale-95 text-lg"
          >
            Lưu Điểm & Hoàn Thành
          </button>
        </motion.div>
      )}
    </div>
  );
};
