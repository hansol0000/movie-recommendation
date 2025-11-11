import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search as SearchIcon } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { motion } from 'framer-motion';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

export function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [visibleResults, setVisibleResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  //  검색 요청 함수 
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setSearchResults([]);
    setVisibleResults([]);

    try {
      const res = await fetch(`http://localhost:8000/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (data.error) {
        setSearchResults([]);
        console.error(data.error);
      } else {
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('검색 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  //  검색 결과 애니메이션
  useEffect(() => {
    if (searchResults.length > 0) {
      setVisibleResults([]);
      searchResults.forEach((item, index) => {
        setTimeout(() => {
          setVisibleResults((prev) => [...prev, item]);
        }, index * 120);
      });
    }
  }, [searchResults]);

  return (
    <PageTransition>
      <div className = "min-h-screen bg-[#f8fbff] px-6 py-16">
        <div className = "max-w-4xl mx-auto">
          {/* 제목 */}
          <motion.h2
            className = "text-4xl font-bold mb-12 text-gray-800 text-center"
            initial = {{ opacity : 0, y : 40 }}
            animate = {{ opacity : 1, y : 0 }}
            transition = {{ duration : 0.5 }}
          >
            영화 검색 🔍
          </motion.h2>

          {/* 검색창 */}
          <motion.form
            onSubmit = {handleSearch}
            className = "flex gap-2 mb-10"
            initial = {{ opacity : 0, y : 30 }}
            animate = {{ opacity : 1, y : 0 }}
            transition = {{ duration : 0.4, delay : 0.2 }}
          >
            <div className = "relative flex-1">
              <SearchIcon className = "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type = "text"
                placeholder = "검색할 영화 제목을 입력하세요."
                value = {searchQuery}
                onChange = {(e) => setSearchQuery(e.target.value)}
                className = "pl-10"
              />
            </div>
            <Button type = "submit" disabled = {isLoading}>
              {isLoading ? '검색 중...' : '검색'}
            </Button>
          </motion.form>

          {/* 검색 결과 출력 */}
          {!hasSearched ? (
            <div className = "border rounded-lg p-10 text-center text-gray-400 bg-white">
              영화를 검색해보세요 🎬
            </div>
          ) : searchResults.length === 0 ? (
            <div className = "border rounded-lg p-10 text-center text-gray-400 bg-white">
              검색 결과가 없습니다 😢
            </div>
          ) : (
            <>
              <p className = "text-gray-500 mb-4">
                "{searchQuery}" 검색 결과 : {searchResults.length}개
              </p>

              <div className = "space-y-4">
                {visibleResults.map((movie, index) => (
                  <motion.div
                    key = {movie.title + index}
                    initial = {{ opacity : 0, y : 20 }}
                    animate = {{ opacity : 1, y : 0 }}
                    transition = {{ duration : 0.3 }}
                    className = "border rounded-lg bg-white p-4 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-4 transition-all"
                    onClick = {() => setSelectedMovie(movie)}
                  >
                    <div className = "w-20 h-28 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      {movie.poster ? (
                        <ImageWithFallback
                          src = {movie.poster}
                          alt = {movie.title}
                          className = "w-full h-full object-cover"
                        />
                      ) : (
                        <div className = "flex items-center justify-center h-full text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className = "flex-1">
                      <h3 className = "text-lg font-semibold text-gray-800 mb-1">{movie.title}</h3>
                      <p className = "text-sm text-gray-500">
                        ⭐ 평점 : {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 상세 정보 모달 */}
        {selectedMovie && (
          <Dialog open = {!!selectedMovie} onOpenChange = {() => setSelectedMovie(null)}>
            <DialogContent className = "max-w-lg">
              <DialogHeader>
                <DialogTitle className = "text-2xl font-bold">{selectedMovie.title}</DialogTitle>
                <DialogDescription>영화 상세 정보</DialogDescription>
              </DialogHeader>

              <div className = "space-y-4">
                {/* 포스터 */}
                <div className = "w-full max-h-[600px] bg-gray-100 rounded overflow-y-auto flex items-start justify-center p-2">
                  {selectedMovie.poster ? (
                    <ImageWithFallback
                      src = {selectedMovie.poster}
                      alt = {selectedMovie.title}
                      className = "w-full h-auto object-contain rounded"
                    />
                  ) : (
                    <p className = "text-gray-400 text-sm">포스터 이미지 없음</p>
                  )}
                </div>

                {/* 개요 */}
                <div className = "space-y-2">
                  <p className = "text-gray-700 text-base whitespace-pre-wrap leading-relaxed">
                    {selectedMovie.overview || '줄거리 정보가 없습니다.'}
                  </p>
                  <p className = "text-sm text-gray-500">
                    개봉일 : {selectedMovie.release_date || '정보 없음'}
                  </p>
                  <p className = "text-sm text-gray-500">
                    평점 : {selectedMovie.rating ? selectedMovie.rating.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </PageTransition>
  );
}
