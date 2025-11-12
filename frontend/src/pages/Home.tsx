import { PageTransition } from '../components/PageTransition';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { motion } from 'framer-motion';

export function Home() {
  const features = [
    {
      title : '영화 추천 받기',
      description : 'A.I가 당신의 상황에 맞는 영화를 추천해줍니다.',
      imageAlt : 'AI 추천 이미지',
      imageSrc : '/images/ai_recommend.png'
    },
    {
      title : '영화 검색 기능',
      description : '추천 받은 영화에 대해 검색해보세요.',
      imageAlt : '검색 이미지',
      imageSrc : '/images/search.png'
    },
    {
      title : '영화 순위 보기',
      description : '추천 받은 영화가 맘에 들지 않으신가요? 다른 플랫폼의 영화 순위를 확인해보세요.',
      imageAlt : '순위 이미지',
      imageSrc : '/images/ranking.png'
    },
  ];

  return (
    <PageTransition>
      <div className = "min-h-screen bg-[#f8fbff] flex flex-col items-center justify-start pt-20 pb-24 px-6">
        {/* 제목 */}
        <motion.div
          className = "text-center mb-16"
          initial = {{ opacity : 0, y : 40 }}
          animate = {{ opacity : 1, y : 0 }}
          transition = {{ duration : 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
             오늘 뭐 볼까? 
          </h1>
        </motion.div>

        {/* 기능 카드 3개 */}
        <div className = "grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-6xl">
          {features.map((feature, index) => (
            <motion.div
              key = {index}
              className = "bg-white rounded-2xl shadow-sm border border-blue-100 hover:shadow-md hover:scale-[1.02] transition-transform duration-300 flex flex-col items-center text-center px-6 py-10"
              initial = {{ opacity : 0, y : 40 }}
              animate = {{ opacity : 1, y : 0 }}
              transition = {{ duration : 0.5, delay : 0.2 + index * 0.2 }}
            >
              {/* 이미지 영역 */}
              <div className = "w-full aspect-square rounded-lg mb-6 flex items-center justify-center bg-[#f1f5ff] overflow-hidden border border-blue-50">
                <ImageWithFallback
                  src = {feature.imageSrc}
                  alt = {feature.imageAlt}
                  className = "w-full h-full object-cover rounded-md"
                />
              </div>

              {/* 제목 */}
              <h3 className = "text-lg font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>

              {/* 설명 */}
              <p className = "text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
