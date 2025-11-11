import { Link, useLocation } from 'react-router-dom';
import { ImageWithFallback } from '../common/ImageWithFallback';

export function Navigation() {
    const location = useLocation();

    const navItems = [
    { name: '홈', path: '/' },
    { name: 'A.I 추천', path: '/ai-recommend' },
    { name: '검색', path: '/search' },
    { name: '순위', path: '/ranking' },
  ];

   return (
    <nav className = "border-b border-gray-200 bg-white shadow-sm fixed w-full top-0 left-0 z-50">
      <div className = "max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* 네비게이션 메뉴 생성 */}
        <div className = "flex gap-8">
          {navItems.map((item) => (
            <Link
              key = {item.path}
              to = {item.path}
              className = {`font-medium transition-colors duration-200 hover:text-blue-600 
                ${
                location.pathname === item.path
                  ? 'text-blue-600'
                  : 'text-gray-600'
                }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* 네비게이션 바 우측 이미지 영역 */}
        <div className = "w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
          <ImageWithFallback
            src = "/images/popcorn.png"
            alt = '대표이미지'
            className = "w-full h-full object-cover"
          />
        </div>
      </div>
    </nav>
  );
}