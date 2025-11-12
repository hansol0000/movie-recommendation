import os
import requests
from deep_translator import GoogleTranslator
from openai import OpenAI
from dotenv import load_dotenv

# 1. .env 파일에서 API 키 불러오기
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

# 2. 환경 변수에서 API 키 읽어오기
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

# 키가 없을 경우 에러 출력
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY를 .env 파일에서 불러 올 수 없습니다. .env 파일을 확인해주세요.")
if not TMDB_API_KEY:
    raise ValueError("TMDB_API_KEY를 .env 파일에서 불러 올 수 없습니다. .env 파일을 확인해주세요.")

# 3. OpenAI 클라이언트 초기화
client = OpenAI(api_key = OPENAI_API_KEY)

# TMDB로 영화 데이터 불러오기
def get_tmdb_movie(keyword : str, count : int = 3):
   
    def search_tmdb(query):
        url = f"https://api.themoviedb.org/3/search/movie"
        params = {
            "api_key" : TMDB_API_KEY,
            "language" : "ko-KR",
            "query" : query
        }
        res = requests.get(url, params=params)

        if res.status_code == 200:
            data = res.json().get("results", [])
            title = [m["title"] for m in data[:count]]
            return title
        return []
    
    # 영어 검색
    result = search_tmdb(keyword)
    if result:
        return result
    
    # 영어 실패시 한국어 번역 재검색
    translate_query = GoogleTranslator(source = 'en', target = 'ko').translate(keyword)
    result_ko = search_tmdb(translate_query)
    if result_ko:
        print(f"TMDB 한글 재검색")
        return result_ko
    
    return []

# OpenAI GPT 모델을 이용 감정 기반 영화 추천문을 생성
def movie_recommend(emotion: str) -> str:
    
    # 1. 감정에 어울리는 영화 키워드 생성
    prompt = (
        f"사용자의 감정은 '{emotion}'이야. "
        f"이 감정이 기쁨이 나온 경우 "
        f"그 기분을 더 오래 지속하거나 즐겁게 확장시켜주는 실제 영화 제목 3편을 영어 원제(Original English title)로만 콤마로 구분해서 말해줘. "
        f"이 감정이 중립이 나온 경우 "
        f"그냥 다양한 장르와 랜덤으로 실제 영화 제목 3편을 영어 원제(Original English title)로만 콤마로 구분해서 말해줘. "
        f"이 감정이 혐오, 두려움, 분노, 슬픔, 놀람이 나온 경우라면 "
        f"그 감정을 완화하거나 회복할 수 있도록 도와주는 영화 3편을 영어 원제(Original English title)로만 콤마로 구분해서 말해줘. "
        f"가능하면 서로 다른 장르, 감독, 개봉 시기의 작품을 골라서 다양하게 추천해줘. "
    )

    try:
        response = client.chat.completions.create(
            model = "gpt-4o-mini",
            messages = [{"role" : "user", "content" : prompt}],
            temperature = 0.8
    )
    except Exception as e:
        print("GPT 키워드 요청 실패", e)
        return "OpenAI API 호출 실패"

    keyword_line = response.choices[0].message.content.strip()
    keyword = [kw.strip() for kw in keyword_line.split(",") if kw.strip()]
    print(f'[GPT 추출 키워드] {keyword}')

    # 2. tmdb 검색으로 실제 영화 이름 가져오기
    tmdb_result = []
    for kw in keyword:
        found = get_tmdb_movie(kw, count = 1)
        tmdb_result.extend(found)

    if not tmdb_result:
        print("TMDB 검색 결과 공백")
        return f"감정 '{emotion}'에 맞는 영화를 검색하지 못하였습니다."
    
    print(f'[TMDB 검색 결과] {tmdb_result}')

    # GPT에게 한국어 설명문 생성 요청
    final_prompt = (
        f"사용자의 감정은 '{emotion}'이고, 추천된 영화는 {tmdb_result}야. "
        f"이 감정이 기쁨이 나온 경우 "
        f"이 영화들이 어떻게 그 감정을 더 확장하고 즐거운 기분을 이어갈 수 있는지 한두문장씩 묘사해줘 "
        f"이 감정이 중립이 나온 경우 "
        f"이 영화들에 대한 간단한 내용이나 줄거리를 설명해주면서 추천해줘. "
        f"이 감정이 혐오, 두려움, 분노, 슬픔, 놀람이 나온 경우라면 "
        f"이 영화들이 어떻게 마음을 안정시키거나 "
        f"완화할 수 있는지 자연스럽게 설명해줘 "
        f"이모티콘을 활용해서 설명을 해도 괜찮을꺼 같아 "
        f"단, 사용자의 감정 상태에 맞는 설명만 작성해줘. 두가지 경우를 모두 쓰지말고 "
        f"그리고 최대한 친근한 말투로 설명을 해줬으면 좋겠어. 예를들어 이 영화는 어떠세요? 라는 친근한 말투로 "
        f"그리고 영화 추천하는 영화 3편을 각각 순번을 정해서 따로따로 설명해 주었으면 좋겠어 최대한 출력이 구분되도록 "   
    )

    try:
        desc_resp = client.chat.completions.create(
            model = "gpt-4o-mini",
            messages = [{"role": "user", "content": final_prompt}],
            temperature = 0.7
        )
    except Exception as e:
        print("GPT 설명 요청 실패:", e)
        return "GPT 설명 생성 실패"

    final = desc_resp.choices[0].message.content.strip()
    print(f"[최종 추천 결과] 길이 : {len(final)}자")
    return final

# 테스트
if __name__ == "__main__":
    test = "기쁨"
    print("테스트 실행 감정 : ", test)
    result = movie_recommend(test)
    print(result)