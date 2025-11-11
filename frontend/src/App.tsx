import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { PageTransition } from './components/PageTransition';

import { Home } from './pages/Home';
import { AIRecommend } from './pages/AIRecommend';
import { Search } from './pages/Search';
import { Ranking } from './pages/Ranking';

function App() {
  return (
    <Router>
      <div className = "flex flex-col min-h-screen bg-[#f8fbff] pt-[70px]">
        <Navigation />
        <main className = "flex-grow">
          <PageTransition>
            <Routes>
              <Route path = "/" element = {<Home />} />
              <Route path = "/ai-recommend" element = {<AIRecommend />} />
              <Route path = "/search" element = {<Search />} />
              <Route path = "/ranking" element = {<Ranking />} />
            </Routes>
          </PageTransition>
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </Router>
  );
}

export default App;

