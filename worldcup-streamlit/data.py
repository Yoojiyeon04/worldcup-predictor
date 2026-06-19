"""정적 데이터: 프리셋, 명단, 부상, 역대전적, 성찰 질문."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from prediction_engine import ModelVariables

Position = Literal["GK", "DF", "MF", "FW"]
Severity = Literal["CRITICAL", "MODERATE", "LIGHT"]


@dataclass(frozen=True)
class Preset:
    name: str
    description: str
    variables: ModelVariables


INITIAL = ModelVariables()

PRESETS: list[Preset] = [
    Preset(
        "📊 객관적 기초 데이터",
        "응원을 배제하고 기초 데이터 가중치를 고르게 정돈한 순수 과학 모델링",
        ModelVariables(cheering_bias=0),
    ),
    Preset(
        "🇰🇷 애국심 극대화 필터",
        "주관적 응원 점수를 최고치로 끌어올려 애국적 편향 시뮬레이션",
        ModelVariables(cheering_bias=95, korea_condition=95),
    ),
    Preset(
        "🧱 진흙탕 수비 승부",
        "공격·전술 가중치를 깎고 극한 수비 텐백 전술(수비 65%) 시나리오",
        ModelVariables(
            offense_weight=10, defense_weight=65, midfield_weight=10,
            experience_weight=10, condition_weight=5, cheering_bias=0,
        ),
    ),
    Preset(
        "⛰️ 멕시코 고산지대 악조건",
        "고산지대·더위로 한국 체력 급감(컨디션 35)을 가정한 시나리오",
        ModelVariables(
            condition_weight=45, korea_condition=35, mexico_condition=85, cheering_bias=0,
        ),
    ),
]


@dataclass(frozen=True)
class Player:
    number: int
    name: str
    eng_name: str
    position: Position
    club: str
    age: int
    caps: int
    goals: int
    perceived_rating: int
    is_key: bool = False
    key_feature: str = ""


KOREA_SQUAD: list[Player] = [
    Player(21, "조현우", "Jo Hyeon-woo", "GK", "울산 HD FC", 34, 35, 0, 88, True, "빛현우 - 반사신경 및 PK 방어"),
    Player(1, "김승규", "Kim Seung-gyu", "GK", "알 샤바브", 35, 82, 0, 85, key_feature="빌드업 경험과 안정적 리딩"),
    Player(12, "송범근", "Song Bum-keun", "GK", "쇼난 벨마레", 28, 4, 0, 78, key_feature="차세대 수문장"),
    Player(4, "김민재", "Kim Min-jae", "DF", "바이에른 뮌헨", 29, 68, 4, 94, True, "월드클래스 피지컬 & 속도"),
    Player(22, "설영우", "Seol Young-woo", "DF", "츠르베나 즈베즈다", 27, 22, 0, 84, key_feature="지치지 않는 체력의 풀백"),
    Player(3, "조유민", "Cho Yu-min", "DF", "샤르자 FC", 29, 9, 0, 80, key_feature="제2의 파이터 수비수"),
    Player(2, "김진수", "Kim Jin-su", "DF", "전북 현대", 34, 74, 2, 81, key_feature="투지와 크로싱"),
    Player(13, "이명재", "Lee Myung-jae", "DF", "울산 HD FC", 32, 7, 0, 79, key_feature="위협적인 왼발 킥"),
    Player(15, "정승현", "Jung Seung-hyun", "DF", "알 와슬", 32, 27, 1, 79, key_feature="강인한 대인공중전"),
    Player(23, "황재원", "Hwang Jae-won", "DF", "대구 FC", 23, 5, 0, 81, key_feature="라이징 풀백"),
    Player(7, "손흥민", "Son Heung-min", "MF", "토트넘", 33, 127, 49, 95, True, "캡틴 - 월드클래스 감아차기"),
    Player(18, "이강인", "Lee Kang-in", "MF", "PSG", 25, 33, 10, 92, True, "탈압박과 킬패스"),
    Player(11, "황희찬", "Hwang Hee-chan", "MF", "울버햄튼", 30, 68, 15, 89, True, "지독한 드리블 돌파"),
    Player(10, "이재성", "Lee Jae-sung", "MF", "마인츠 05", 33, 90, 11, 86, key_feature="전천후 유틸리티"),
    Player(6, "황인범", "Hwang In-beom", "MF", "페예노르트", 29, 62, 6, 88, key_feature="중원 사령관"),
    Player(17, "배준호", "Bae Jun-ho", "MF", "스토크 시티", 22, 6, 2, 84, key_feature="라이징 플레이메이커"),
    Player(5, "박용우", "Park Yong-woo", "MF", "알 아인", 32, 21, 0, 78, key_feature="중원 빌드 브릿지"),
    Player(8, "홍현석", "Hong Hyun-seok", "MF", "마인츠 05", 27, 16, 0, 82, key_feature="하프스페이스 공략"),
    Player(14, "엄원상", "Um Won-sang", "MF", "울산 HD FC", 27, 9, 0, 80, key_feature="KTX급 스피드 윙어"),
    Player(9, "주민규", "Joo Min-kyu", "FW", "울산 HD FC", 36, 10, 4, 83, key_feature="포스트 플레이"),
    Player(19, "오세훈", "Oh Se-hun", "FW", "마치다 젤비아", 27, 6, 1, 81, key_feature="고타점 헤더"),
    Player(16, "조규성", "Cho Gue-sung", "FW", "FC 미트윌란", 28, 39, 9, 84, key_feature="카타르 월드컵 영웅"),
]

MEXICO_SQUAD: list[Player] = [
    Player(1, "루이스 말라곤", "Luis Malagón", "GK", "클럽 아메리카", 29, 14, 0, 86, True, "신형 특급 거미"),
    Player(12, "훌리오 곤살레스", "Julio González", "GK", "UNAM", 35, 5, 0, 79, key_feature="노련한 위기 극복"),
    Player(23, "라울 랑헬", "Raúl Rangel", "GK", "과달라하라", 26, 1, 0, 76, key_feature="공중볼 포착력"),
    Player(3, "세사르 몬테스", "César Montes", "DF", "로코모티프", 29, 47, 1, 87, True, "공중전 절대 우위"),
    Player(5, "호안 바스케스", "Johan Vásquez", "DF", "제노아", 27, 25, 1, 85, key_feature="세리에 A 철벽"),
    Player(6, "헤라르도 아르테아가", "Gerardo Arteaga", "DF", "CF 몬테레이", 27, 26, 1, 82, key_feature="스윙 백어택"),
    Player(2, "호르헤 산체스", "Jorge Sánchez", "DF", "크루스 아술", 28, 43, 1, 83, key_feature="오버래핑 풀백"),
    Player(13, "이스라엘 레예스", "Israel Reyes", "DF", "클럽 아메리카", 26, 16, 2, 80, key_feature="홀딩 세이퍼"),
    Player(15, "브라이언 가르시아", "Brian García", "DF", "톨루카", 28, 3, 0, 77, key_feature="공격 전환 윙백"),
    Player(4, "에드손 알바레스", "Edson Álvarez", "MF", "웨스트햄", 28, 80, 5, 92, True, "압도적 피지컬 홀딩"),
    Player(18, "루이스 차베스", "Luis Chávez", "MF", "디나모 모스크바", 30, 32, 3, 88, True, "명품 프리킥"),
    Player(7, "루이스 로모", "Luis Romo", "MF", "크루스 아술", 30, 48, 3, 83, key_feature="박스 투 박스"),
    Player(14, "에릭 산체스", "Érick Sánchez", "MF", "클럽 아메리카", 26, 29, 3, 82, key_feature="오프더볼 침투"),
    Player(17, "오르벨린 피네다", "Orbelín Pineda", "MF", "AEK 아테네", 30, 73, 10, 84, key_feature="창의적 플레이메이킹"),
    Player(8, "카를로스 로드리게스", "Carlos Rodríguez", "MF", "크루스 아술", 29, 50, 0, 81, key_feature="중원 템포 고정"),
    Player(9, "산티아고 히메네스", "Santiago Giménez", "FW", "페예노르트", 25, 30, 4, 90, True, "차세대 에이스"),
    Player(11, "우리엘 안투나", "Uriel Antuna", "FW", "티그레스", 28, 62, 13, 84, key_feature="매서운 치달"),
    Player(10, "알렉시스 베가", "Alexis Vega", "FW", "톨루카", 28, 31, 6, 83, key_feature="화려한 기술"),
    Player(21, "훌리안 키뇨네스", "Julián Quiñones", "FW", "알 카디시야", 29, 11, 2, 85, key_feature="강인한 피지컬"),
    Player(16, "세사르 우에르타", "César Huerta", "FW", "UNAM", 25, 12, 1, 81, key_feature="일대일 돌파"),
]


@dataclass(frozen=True)
class InjuredPlayer:
    id: str
    name: str
    eng_name: str
    position: Position
    club: str
    injury_type: str
    severity: Severity
    rehab_stage: int
    expected_return: str
    tactical_impact: str
    is_mainpillar: bool


KOREA_INJURIES = [
    InjuredPlayer("kor-1", "조규성", "Cho Gue-sung", "FW", "FC 미트윌란", "무릎 반월판 수술 및 재활", "CRITICAL", 75, "2026년 8월 초", "타겟맨 부재로 공격 연계 전반 영향", True),
    InjuredPlayer("kor-2", "설영우", "Seol Young-woo", "DF", "츠르베나 즈베즈다", "어깨 습관성 탈구 수술 후 재활", "MODERATE", 90, "실전 훈련 합류", "우측 측면 빌드업 제한", True),
    InjuredPlayer("kor-3", "손흥민", "Son Heung-min", "MF", "토트넘", "가벼운 햄스트링 타이트니스", "LIGHT", 95, "즉각 출전 가능", "전술 핵심, 로테이션 검토", True),
    InjuredPlayer("kor-4", "김승규", "Kim Seung-gyu", "GK", "알 샤바브", "십자인대 수술 후 컨디셔닝", "MODERATE", 93, "스쿼드 등록 완료", "조현우 주전 체제 경쟁", False),
]

MEXICO_INJURIES = [
    InjuredPlayer("mex-1", "산티아고 히메네스", "Santiago Giménez", "FW", "페예노르트", "대퇴사두근 미세 손상", "MODERATE", 80, "2026년 6월 말", "최전방 결정력 45% 유실", True),
    InjuredPlayer("mex-2", "에드손 알바레스", "Edson Álvarez", "MF", "웨스트햄", "습관성 햄스트링 과부하", "LIGHT", 92, "즉시 출전 가능", "수비 반경 축소 우려", True),
    InjuredPlayer("mex-3", "루이스 말라곤", "Luis Malagón", "GK", "클럽 아메리카", "어깨 건염 회복", "LIGHT", 98, "메디컬 클리어", "무실점 방어 안정성 회복", True),
    InjuredPlayer("mex-4", "호안 바스케스", "Johan Vásquez", "DF", "제노아", "발목 약한 염좌", "LIGHT", 88, "경기 직전 합류", "센터백 커버 장력 약화", False),
]


@dataclass(frozen=True)
class HistoricalMatch:
    id: str
    date: str
    competition: str
    score: str
    winner: Literal["Korea", "Mexico", "Draw"]
    korea_goals: list[str]
    mexico_goals: list[str]
    description: str
    highlight: str
    is_worldcup: bool


HISTORICAL_MATCHES = [
    HistoricalMatch("2018", "2018년 6월 23일", "2018 러시아 월드컵 F조 2차전", "대한민국 1 : 2 멕시코", "Mexico",
                    ["손흥민 90+3' (원더골)"], ["카를로스 벨라 26' (PK)", "하비에르 에르난데스 66'"],
                    "손흥민 만회골에도 PK 실점과 역습 골에 패배.", "손흥민", True),
    HistoricalMatch("2020", "2020년 11월 14일", "A매치 친선경기", "대한민국 2 : 3 멕시코", "Mexico",
                    ["황의조 20'", "권경원 87'"], ["라울 히메네스 67'", "안투나 69'", "살세도 70'"],
                    "후반 3분간 3골 허용 역전패.", "황의조", False),
    HistoricalMatch("1998", "1998년 6월 13일", "1998 프랑스 월드컵 E조 1차전", "대한민국 1 : 3 멕시코", "Mexico",
                    ["하석주 28' (프리킥)"], ["펠라에스 50'", "루이스 에르난데스 75', 84'"],
                    "첫 선제골 후 하석주 퇴장, 역전패.", "하석주", True),
    HistoricalMatch("2014", "2014년 1월 29일", "국가대표 평가전", "대한민국 0 : 4 멕시코", "Mexico",
                    [], ["알란 풀리도 37', 58', 89'", "오리베 페랄타 40'"],
                    "알란 풀리도 해트트릭 대패.", "알란 풀리도", False),
    HistoricalMatch("2001", "2001년 6월 1일", "2001 컨페더레이션스컵", "대한민국 2 : 1 멕시코", "Korea",
                    ["황선홍 56'", "유상철 90'"], ["빅토르 루이스 81'"],
                    "유상철 극적 결승골, FIFA 공식대회 첫 승.", "유상철", False),
    HistoricalMatch("1948", "1948년 8월 2일", "1948 런던 올림픽 8강", "대한민국 5 : 3 멕시코", "Korea",
                    ["최성곤 13'", "배종호 30'", "정국진 52', 67'", "정남식 77'"],
                    ["카사린 8'", "루이스 15'", "코로나 85'"],
                    "올림픽 4강 신화를 향한 5-3 대승.", "정국진", False),
]

REFLECTION_QUESTIONS = [
    {
        "id": "prob_35",
        "question": "Q1. 확률 35%인 팀이 이기면 예측 모델은 정말 틀린 걸까요?",
        "guide": "아닙니다. 확률 35%는 대략 3경기 중 1경기는 실제로 일어남을 뜻합니다. 35% 팀이 이겼다고 '틀렸다'고 단정하는 것은 확률적 사고를 OX 퀴즈로 오해하는 이분법적 태도입니다.",
    },
    {
        "id": "evidence_vs_cheer",
        "question": "Q2. 경기 예측에서 객관적인 '근거'와 주관적인 '응원'은 어떻게 구분해야 할까요?",
        "guide": "'근거'는 관측 가능한 정량 데이터를 공정한 수식에 대입하는 것입니다. '응원'은 데이터와 무관하게 특정 팀 승리만을 염원하는 감정적 희망입니다.",
    },
    {
        "id": "ai_trust",
        "question": "Q3. AI가 '한국 승 80%'라고 추정했을 때, 그냥 믿어도 될까요?",
        "guide": "결코 맹신해서는 안 됩니다. AI의 80%는 주입된 데이터와 가중치 하에서의 계산 결과일 뿐입니다. 돌발 변수를 고려하지 못하면 과적합일 수 있습니다.",
    },
    {
        "id": "first_show",
        "question": "Q4. '최종 결과 확률'보다 먼저 사용자에게 보여줘야 하는 것은?",
        "guide": "기초 데이터 출처, 가중치 설계 원리(Assumptions), 모델의 본질적 한계점을 먼저 보여줘야 합니다.",
    },
]

SEVERITY_LABEL = {
    "CRITICAL": "🔴 수술/치료",
    "MODERATE": "🟡 재활 단계",
    "LIGHT": "🟢 예방 관리",
}
