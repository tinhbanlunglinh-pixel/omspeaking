import { useState, useRef, useCallback } from 'react';
import { evaluateSpeakingAnswer } from '../services/geminiService';
import { EnglishLevel } from '../types';

export function useQuestionRecorder(
  questionText: string,
  expectedAnswer: string,
  level: EnglishLevel
) {
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<{score: number, feedback: string, isCorrect: boolean, transcribedText: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);

  const handleEvaluate = useCallback(async (audioBlob: Blob, mimeType: string) => {
    setIsEvaluating(true);
    setError(null);
    try {
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            if (!base64 || base64.length < 100) {
              reject(new Error("Audio data is empty."));
              return;
            }
            resolve(base64);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read audio file"));
        reader.readAsDataURL(audioBlob);
      });

      const evalResult = await evaluateSpeakingAnswer(questionText, expectedAnswer, base64Audio, level, mimeType);
      setResult(evalResult);
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setError(err?.message || "Lỗi chấm điểm câu trả lời. Vui lòng thử lại.");
    } finally {
      setIsEvaluating(false);
    }
  }, [questionText, expectedAnswer, level]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } 
      });

      const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const supportedType = preferredTypes.find(t => MediaRecorder.isTypeSupported(t)) || '';
      
      const mediaRecorder = new MediaRecorder(stream, supportedType ? { mimeType: supportedType } : {});
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          const mimeType = mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          if (audioBlob.size < 100) {
            setError("Không thu được âm thanh.");
            return;
          }
          await handleEvaluate(audioBlob, mimeType);
        } finally {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      isRecordingRef.current = true;
      setIsRecording(true);
      setResult(null);
      setError(null);
    } catch (err: any) {
      setError("Không thể truy cập micro.");
    }
  }, [handleEvaluate]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecordingRef.current) {
      setIsEvaluating(true);
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        isRecordingRef.current = false;
        setIsRecording(false);
      }, 300);
    }
  }, []);

  return { isRecording, isEvaluating, result, error, startRecording, stopRecording };
}
