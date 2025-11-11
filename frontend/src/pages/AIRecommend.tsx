import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { PageTransition } from '../components/PageTransition';
import { motion } from 'framer-motion';

export function AIRecommend() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [displayedResult, setDisplayedResult] = useState(''); 

  const typingIdRef = useRef(0);

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const startTyping = async (text: string, speed = 25) => {

    const safeText = text ?? '';
    const myId = ++typingIdRef.current;

    setDisplayedResult('');

    for (let i = 0; i < safeText.length; i++) {
      if (typingIdRef.current !== myId)
         return;
      setDisplayedResult((prev) => prev + safeText[i]);
      await sleep(speed);
    }
  };

  // 백엔드 연동 함수
  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setResult('');
    setDisplayedResult('');

    typingIdRef.current++;

    try {
      const res = await fetch('http://localhost:8000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotion: input }),
      });

      const data = await res.json();

      let finalText = '';
      if (data.error) {
        finalText = `${data.error}`;
      } else if (data.result) {
        finalText = String(data.result);
      } else {
        finalText = '서버로부터 정상적인 답변을 받지 못했습니다.';
      }

      setResult(finalText);
      await startTyping(finalText, 20); 
    } catch (err) {
      console.error(err);
      const errText = '서버에 연결할 수 없습니다.';
      setResult(errText);
      await startTyping(errText, 20);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className = "min-h-screen bg-[#f8fbff] px-6 py-16 flex flex-col items-center justify-start">
        <motion.div
          className = "text-center mb-8"
          initial = {{ opacity : 0, y : 40 }}
          animate = {{ opacity : 1, y : 0 }}
          transition = {{ duration : 0.5 }}
        >
          <h1 className = "text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
            오늘은 무슨일이 있었나요❓
          </h1>
          <p className = "text-gray-500 text-base">A.I가 상황에 맞는 영화를 추천해 드립니다❗</p>
        </motion.div>

        <motion.div
          className = "w-full max-w-3xl bg-white shadow-md border border-blue-100 rounded-xl p-8 space-y-6"
          initial = {{ opacity : 0, y : 40 }}
          animate = {{ opacity : 1, y : 0 }}
          transition = {{ duration : 0.6, delay : 0.2 }}
        >
          <Textarea
            placeholder = {`오늘 있었던 일이나 감정을 입력해주세요. (최대한 자세히 작성할수록 AI가 더 정확히 추천합니다.)`}
            value = {input}
            onChange = {(e) => setInput(e.target.value)}
            className = "min-h-[160px] resize-none"
          />

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium py-3"
          >
            {isLoading ? '추천 중...' : '🎬 영화 추천받기'}
          </Button>
        </motion.div>

        {/* 결과 출력 */}
        {displayedResult !== '' && (
          <motion.div
            className = "w-full max-w-3xl mt-12 bg-white border border-blue-100 rounded-xl shadow-sm p-8 text-left"
            initial = {{ opacity : 0, y : 20 }}
            animate = {{ opacity : 1, y : 0 }}
            transition = {{ duration : 0.6 }}
          >
            <p className = "whitespace-pre-wrap text-gray-700 leading-relaxed">
              {displayedResult}
              {displayedResult.length < (result?.length ?? 0) && (
                <span className = "inline-block w-1 h-5 bg-blue-600 ml-1 animate-pulse" />
              )}
            </p>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}


