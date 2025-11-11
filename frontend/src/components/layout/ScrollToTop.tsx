import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    // 스크롤 위치를 감지
    useEffect(() => {
        const onScroll = () => {
            setIsVisible(window.scrollY > 300);    
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <button
            onClick = {() => window.scrollTo({ top : 0, behavior : 'smooth' })}
            className = 'fixed bottom-8 right-8 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all duration-300 hover:scale-110 z-50'
            aria-label = '상단으로 가기'
        >
            <ArrowUp className = 'w-6 h-6' />
        </button>
    );
}
