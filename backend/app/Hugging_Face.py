# 한국어 기반 감정 추출 모듈이 현제 없거나 비공개인 상황
# 때문에 영어 기반 감정 추출 모듈을 사용할 예정 (j-hartmann/emotion-english-distilroberta-base)
# 한국어 → 영어 번역 → 영어 감정 분석 → 한국어 감정명으로 변환
# 입력된 문장에서 7가지 감정(기쁨, 슬픔, 분노, 혐오, 두려움, 놀람, 중립)중 하나를 판단한다.

from transformers import pipeline
from deep_translator import GoogleTranslator

# 1.분석 파이프라인 초기화 (pipeline()을 사용해 특정 테스크에 맞는 모델을 로드하고 실행을 간소화)
emotion_analyze = pipeline(
    "text-classification",                                   # 테스크 유형 : 텍스트 분류
    model = "j-hartmann/emotion-english-distilroberta-base",
    return_all_scores = False                                # 가장 높은 확률의 감정 한개 반환 
)

# 2. 한국어 -> 영어 번역기 초기화
translator = GoogleTranslator(source = 'ko', target = 'en')

# 3. 감정 추출 함수 작성
def analyze_emotion(text: str) -> str:
    # 입력 문자열이 비어있거나 공백일 시 > 감정 분류 불가능 > "감정을 분류할 수 없습니다. 다시 입력해주세요." 문구 출력
    if not text.strip():
        return "감정을 분류할 수 없습니다. 다시 입력해주세요."
    
    # 1) 한국어 문장을 영어로 번역
    translated_text = translator.translate(text)

    # 2) 영어 감정 분석 수행
    result = emotion_analyze(translated_text)[0]
    english_label = result["label"]

    # 3) 영어 감정을 한국어로 매핑하기
    label = {
        "anger" : "분노",
        "disgust" : "혐오",
        "fear" : "두려움",
        "joy" : "기쁨",
        "neutral" : "중립",
        "sadness" : "슬픔",
        "surprise" : "놀람"
    }

    emotion_kr = label.get(english_label, english_label)
    return emotion_kr

# 모듈 단독 실행 시 테스트 코드 실행
if __name__ == "__main__":
    text = "직장상사가 또 나한테 뭐라했어. 너무 화가나!"
    emotion = analyze_emotion(text)
    print(f"입력 문장 : {text}")
    print(f"감정 분석 결과: {emotion}")