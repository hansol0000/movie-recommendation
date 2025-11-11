import { useState, useEffect } from 'react';
import { PageTransition } from '../components/PageTransition';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

type PlatformType = 'TMDB' | 'KOBIS' | 'IMDB';

interface MovieRank {
  title : string;
  poster? : string | null;
  rating? : number;
  rank? : number;
}

export function Ranking() {
    const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('TMDB');
    const [rankingData, setRankingData] = useState<MovieRank[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);

    // 플랫폼 변경 할 때 순위 데이터 가져오기
    useEffect(() => {
        async function fetchRanking() {
            setIsLoading(true);
            try {
                const endpoint = selectedPlatform.toLowerCase();
                const res = await fetch(`http://localhost:8000/rank/${endpoint}`);
                const data = await res.json();

                if (data.results) {
                    setRankingData(data.results);
                } else {
                    setRankingData([]);
                    console.error('데이터를 불러오지 못했습니다. : ', data);
                }
            } catch (error){
                console.error('에러 발생 : ', error);
                setRankingData([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRanking();
    }, [selectedPlatform]);

    const handlePlatformChange = (platform : PlatformType) => {
        if (platform !== selectedPlatform) {
            setSelectedPlatform(platform);
            setAnimationKey((prev) => prev + 1);
        }
    };

    return (
        <PageTransition>
            <div className = 'min-h-screen bg-[#f8fbff] px-6 py-16'>
                <div className = 'max-w-4xl mx-auto'>
                    {/* 제목 */}
                    <motion.h2
                        className = "text-4xl font-bold mb-8 text-center text-gray-800"
                        initial = {{ opacity : 0, y : 40 }}
                        animate = {{ opacity : 1, y : 0 }}
                        transition = {{ duration : 0.5 }}
                    >
                        영화 순위 📈
                    </motion.h2>

                    {/* 플랫폼 선택 버튼 */}
                    <div className = "flex gap-3 justify-center mb-12">
                        {(['TMDB', 'KOBIS', 'IMDB'] as PlatformType[]).map((platform) => (
                        <Button
                            key = {platform}
                            variant = {selectedPlatform === platform ? 'default' : 'outline'}
                            onClick = {() => handlePlatformChange(platform)}
                            className = "flex-1 md:flex-none min-w-[10rem] text-sm md:text-base font-medium"
                        >
                            {platform === 'TMDB' ? 'TMDB(최고평점)' : platform === 'KOBIS' ? 'KOBIS(일별 박스오피스)' : platform  === 'IMDB' ? 'IMDB(최고평점)' : platform}
                        </Button>
                        ))}
                    </div>

                    {/* 순위 목록 */}
                    <div className = "space-y-4">
                        {isLoading ? (
                            <p className = "text-center text-gray-400 py-10">불러오는 중...</p>
                        ) : rankingData.length === 0 ? (
                            <p className = "text-center text-gray-400 py-10">
                            {selectedPlatform} 데이터를 불러오는 중 문제가 발생했습니다.
                            </p>
                        ) : (
                            rankingData.slice(0, 10).map((movie, index) => (
                                <motion.div
                                    key = {`${animationKey}-${index}`}
                                    initial = {{ opacity : 0, y : 40 }}
                                    animate = {{ opacity : 1, y : 0 }}
                                    transition = {{
                                        duration : 0.3,
                                        delay : index * 0.07,
                                        ease : 'easeOut'
                                    }}
                                    className = 'border rounded-lg p-6 flex items-center gap-6 bg-white hover:shadow-md transtion-all'>
                                        {/* 순위 숫자 */}
                                        <div className = 'flex-shrink-0 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold'>
                                            {index + 1}
                                        </div>

                                        {/* 영화 정보 */}
                                        <div className = 'flex-1 min-w-0'>
                                            <h3 className = 'text-lg font-semibold text-gray-800 truncate mb-1'>
                                                {movie.title || '제목 없음'}
                                            </h3>
                                            <p className = 'text-sm text-gray-500'>
                                                ⭐ 평점 : {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                                            </p>
                                        </div>
                                        
                                        {/* 포스터 */}
                                        <div className = 'flex-shrink-0 w-20 h-28 bg-gray-200 rounded overflow-hidden shadow-sm'>
                                            {movie.poster ? (
                                                <ImageWithFallback
                                                    src = {movie.poster}
                                                    alt = {movie.title}
                                                    className = 'w-full h-full object-cover'
                                                />
                                            ) : (
                                                <div className = 'flex items-center justify-center h-full text-gray-300 text-xs'>
                                                    No Img
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>        
                                ))
                            )}    
                        </div>

                        {/* 하단 문구 */}
                        <div className = 'mt-10 text-center text-gray-400 text-sm'>
                            {selectedPlatform} 순위 TOP 1️⃣~🔟
                        </div>
                    </div>
                </div>
        </PageTransition>
    );
}