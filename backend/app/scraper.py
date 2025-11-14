import os
import time
import logging
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from typing import List, Dict, Optional
from requests.adapters import HTTPAdapter, Retry
from datetime import datetime, timedelta, timezone

# .env 파일에서 API 키 불러오기
load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
KOBIS_API_KEY = os.getenv("KOBIS_API_KEY")

if not TMDB_API_KEY:
    raise ValueError("TMDB_API_KEY를 .env 파일에서 불러 올 수 없습니다. .env 파일을 확인해주세요.")
if not KOBIS_API_KEY:
    raise ValueError("KOBIS_API_KEY를 .env 파일에서 불러 올 수 없습니다. .env 파일을 확인해주세요.")

# 로깅 설정
logging.basicConfig(level = logging.INFO)
logger = logging.getLogger("scraper")

def create_session(retries: int = 3, backoff_factor: float = 0.3, 
                   status_forcelist = (429, 500, 502, 503, 504)) -> requests.Session:
    sess = requests.Session()
    retry_strategy = Retry(
        total = retries,
        backoff_factor = backoff_factor,
        status_forcelist = status_forcelist,
        allowed_methods = frozenset(["GET", "POST", "HEAD"])
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    sess.mount("https://", adapter)
    sess.mount("http://", adapter)

    sess.headers.update({
        "User-Agent": "Mozilla/5.0 (compatible; MovieRankScraper/1.0; +https://yourdomain.example)"
    })
    return sess

session = create_session()

# TMDB에서 영화 제목으로 검색해서 포스터 가져오기
def search_tmdb_poster(title : str, year : Optional[str] = None, api_key : Optional[str] = None) -> Optional[str]:
    
    # TMDB API로 영화 제목을 검색해서 포스터 URL을 반환
    api_key = api_key or TMDB_API_KEY
    if not api_key:
        return None
    
    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key" : api_key,
        "query" : title,
        "language" : "ko-KR"
    }
    
    if year:
        params["year"] = year
    
    try:
        resp = session.get(url, params = params, timeout = 10)
        resp.raise_for_status()
        data = resp.json()
        results = data.get("results", [])
        
        if results:
            poster_path = results[0].get("poster_path")
            if poster_path:
                return f"https://image.tmdb.org/t/p/w500{poster_path}"
        
        return None
    except Exception as e:
        logger.warning(f"TMDB 포스터 검색 실패 ({title}): {e}")
        return None

# TMDB 랭킹 가져오기 
def get_tmdb_rank(api_key: Optional[str] = None, language: str = "ko-KR", page: int = 1) -> List[Dict]:
    api_key = api_key or TMDB_API_KEY
    if not api_key:
        raise ValueError("TMDB API KEY 필요")
    
    url = "https://api.themoviedb.org/3/movie/top_rated"
    params = {"api_key" : api_key, "language" : language, "page" : page}
    resp = session.get(url, params = params, timeout=  10)
    resp.raise_for_status()
    data = resp.json()
    results = data.get("results", [])

    output = []
    for idx, m in enumerate(results, start = 1 + (page - 1) * 20):
        output.append({
            "source" : "tmdb",
            "rank" : idx,
            "title" : m.get("title") or m.get("original_title"),
            "year" : (m.get("release_date") or "")[:4],
            "score" : m.get("vote_average"),
            "url" : f"https://www.themoviedb.org/movie/{m.get('id')}" if m.get("id") else None,
            "poster" : f"https://image.tmdb.org/t/p/w500{m.get('poster_path')}" if m.get("poster_path") else None,
            "extra" : {
                "original_title" : m.get("original_title"),
                "tmdb_id" : m.get("id"),
                "vote_count" : m.get("vote_count")
            }
        })
    return output

# KOBIS -> TMDB에서 포스터 가져오기 추가 (KOBIS API에 포스터 이미지를 따로 제공 X)
def get_kobis_rank(api_key : Optional[str] = None, date : Optional[str] = None, 
                   fetch_posters : bool = True) -> List[Dict]:
# 시간이 조금 걸림
    api_key = KOBIS_API_KEY
    if not api_key:
        raise ValueError("KOBIS API KEY 필요!")
    
    # KST로 어제를 계산해서 일간 박스오피스 순위 반환.
    if date is None:
        kst = timezone(timedelta(hours = 9))
        date = (datetime.now(kst) - timedelta(days = 1)).strftime("%Y%m%d")
        
    url = "http://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json"
    params = {"key" : api_key, "targetDt" : date}

    resp = session.get(url, params = params, timeout = 10)
    resp.raise_for_status()
    data = resp.json()
   
    boxoffice = data.get("boxOfficeResult", {}).get("dailyBoxOfficeList", [])
    output = []
    
    for item in boxoffice:
        title = item.get("movieNm")
        year = (item.get("openDt") or "")[:4]
        
        # 포스터 검색 
        poster_url = None
        if fetch_posters and title:
            logger.info(f"KOBIS: '{title}' 포스터 검색 중")
            poster_url = search_tmdb_poster(title, year)
            time.sleep(0.3)  
        
        output.append({
            "source" : "kobis",
            "rank" : int(item.get("rank")) if item.get("rank") else None,
            "title" : title,
            "year" : year,
            "score" : None,  
            "url" : None,
            "poster" : poster_url,  
            "extra" : {
                "movieCd" : item.get("movieCd"),
                "openDt" : item.get("openDt"),
                "audiCnt" : item.get("audiCnt"),
                "audiAcc" : item.get("audiAcc"),
                "rankInten" : item.get("rankInten")
            }
        })
    return output

def get_imdb_rank(limit : int = 250) -> List[Dict]:

    url = "https://www.imdb.com/chart/top"
    resp = session.get(url, timeout = 15)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    movies = soup.select("ul.ipc-metadata-list li.ipc-metadata-list-summary-item")
    output = []

    for idx, item in enumerate(movies, start=1):
        if idx > limit:
            break
        
        title_tag = item.select_one("a.ipc-title-link-wrapper")
        rating_tag = item.select_one(".ipc-rating-star--rating")
        year_tag = item.select_one(".ipc-metadata-list-summary-item__li")
        
        # 포스터 이미지 추출
        poster_tag = item.select_one("img.ipc-image")
        poster_url = None
        if poster_tag and poster_tag.has_attr("src"):
            # IMDB 이미지 URL에서ㅍ추출
            raw_poster = poster_tag["src"]
            # 원본 크기로 변경
            poster_url = raw_poster.split("._")[0] + "._V1_.jpg" if "._" in raw_poster else raw_poster

        output.append({
            "source" : "imdb",
            "rank" : idx,
            "title" : title_tag.text.strip() if title_tag else "",
            "year" : year_tag.text.strip() if year_tag else "",
            "score" : float(rating_tag.text.strip()) if rating_tag else None,
            "url" : f"https://www.imdb.com{title_tag['href'].split('?')[0]}" if title_tag and title_tag.has_attr('href') else None,
            "poster" : poster_url, 
            "extra" : {}
        })
    return output

# 소스 통합
def integration_sources(*lists_of_movies : List[Dict]) -> List[Dict]:
    integration : List[Dict] = []
    for lst in lists_of_movies:
        if not isinstance(lst, list):
            logger.warning("통합 대상이 리스트가 아님: %s", type(lst))
            continue
        integration.extend(lst)
    return integration