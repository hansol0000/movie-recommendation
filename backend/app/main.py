import os
import requests
from fastapi import FastAPI, Body, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 내부 묘듈 import 하기
from Hugging_Face import analyze_emotion
from OpenAi_API import movie_recommend
from scraper import get_tmdb_rank, get_kobis_rank, get_imdb_rank

load_dotenv(dotenv_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

app = FastAPI(
    title = "Movie Backend API",
    description = "영화 추천/검색/순위 통합 서버",
    version = "1.0.0"
)
 
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

# AI 감정 기반 추천 기능
@app.post("/recommend")
def recommend_movie(data: dict = Body(...)):
    user_text = data.get('diary') or data.get('emotion', '')

    if not user_text.strip():
        return {"error" : "텍스트를 입력해주세요."}
    
    try:
        print(f"[받은 입력] {user_text}")

        # Hugging Face 모델 감정 분석
        emotion = analyze_emotion(user_text)
        print(f"[분석된 감정] {emotion}")

        # 감정 분석 실패 확인
        if emotion == "감정을 분류할 수 없습니다.":
            return {'error' : emotion}
        
        # OpenAi로 영화 추천
        recommend = movie_recommend(emotion)
        print(f'[추천 결과] {recommend[:100]}...')

        if recommend is None or not recommend:
            return {'error' : '영화 추천 생성 실패.'}
        
        recommend = str(recommend).replace('undefined', '').strip()

        # 인사말 + 추천 결과 조합
        a = f'🔍 감정 추출 결과 : {emotion}\n\n'
        full_result = a + recommend

        # 응답 반환
        return {
            'result' : full_result,
            'emotion' : emotion,
            'recommendation' : recommend,
            'success' : True
        }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {'error' : f'오류 발생 : {str(e)}'}


# 영화 검색 기능
@app.get("/search")
def search_movie(query : str = Query(..., description = "검색할 영화 제목")):
    if not query.strip():
        return {"error" : "검색어가 필요합니다."}
    
    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key" : TMDB_API_KEY,
        "query" : query,
        "language" : "ko-KR",
        "page" : 1
    }

    res = requests.get(url, params = params)
    if res.status_code != 200:
        return {"error" : "TMDB API 호출 실패.", "status_code" : res.status_code}
    
    data = res.json()
    results = data.get("results", [])
    movies = [
        {
            "title" : m.get("title"),
            "release_date" : m.get("release_date"),
            "rating" : m.get("vote_average"),
            "overview" : m.get("overview"),
            "poster" : f"https://image.tmdb.org/t/p/w500{m['poster_path']}" if m.get("poster_path") else None
        }
        for m in results
    ]
    return {"results": movies}

# 영화 순위 기능 (각각의 웹사이트)
@app.get("/rank/tmdb")
def rank_tmdb():
    try:
        movies = get_tmdb_rank(page=1)
        return {
            "results": [
                {
                    "title": m["title"],
                    "poster": m["poster"],  
                    "rating": m["score"],
                    "rank": m["rank"]
                }
                for m in movies[:10]
            ]
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/rank/kobis")
def rank_kobis():
    try:
        # 포스터 검색 활성화
        movies = get_kobis_rank(fetch_posters = True)
        return {
            "results": [
                {
                    "title" : m["title"],
                    "poster" : m["poster"],     # 포스터 tmdb api 가져오기
                    "rating" : None,            # KOBIS 평점기능 x
                    "rank" : m["rank"]
                }
                for m in movies[:10]
            ]
        }
    except Exception as e:
        return {"error" : str(e)}

@app.get("/rank/imdb")
def rank_imdb():
    try:
        movies = get_imdb_rank(limit = 10)
        return {
            "results" : [
                {
                    "title" : m["title"],
                    "poster" : m["poster"],  
                    "rating" : m["score"],
                    "rank" : m["rank"]
                }
                for m in movies
            ]
        }
    except Exception as e:
        return {"error": str(e)}
