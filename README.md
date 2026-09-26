# DAYLOG

일정을 관리하고, 하루를 기록하며, AI와 함께 하루를 돌아보는 개인 캘린더 웹서비스입니다.

**배포 URL**: https://daylog-blush-seven.vercel.app

## 소개

Google Calendar처럼 실용적인 월간 달력에서 시작해, 주간 일정을 거쳐 특정 날짜의 상세 화면까지 이동할 수 있는 개인 일정 관리 서비스입니다. 하루 상세 화면에서는 그날의 기분과 자유 기록을 남길 수 있고, 작성한 기록을 AI가 짧게 회고해주는 기능을 제공합니다.

## 주요 기능

- **월간 캘린더**: 이전/다음 달 이동, 오늘 날짜 강조, 여러 날에 걸친 일정을 막대로 표시
- **주간 화면**: 7일을 가로로 배치, 요일별 토글로 일정 목록 펼쳐보기
- **하루 상세 화면**: 일정 목록, 기분 이모지 선택, 자유 기록 텍스트 영역
- **일정 관리**: 추가/수정/삭제, localStorage로 새로고침 후에도 데이터 유지
- **AI 하루 회고**: 그날의 기록과 일정을 바탕으로 AI가 2~4문장 요약과 키워드를 생성

## 기술 스택

- **프론트엔드**: HTML, CSS, Vanilla JavaScript (프레임워크 미사용)
- **백엔드**: Vercel Serverless Functions (Python)
- **AI 연동**: Codyssey 프록시 엔드포인트 (OpenAI 호환 Chat Completions API)
- **데이터 저장**: 브라우저 localStorage
- **배포**: Vercel

## 프로젝트 구조

```
daylog/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── calendar.js
│   ├── week.js
│   ├── day.js
│   ├── modal.js
│   └── storage.js
├── api/
│   └── reflect.py
├── requirements.txt
├── pyproject.toml
├── README.md
└── .env.example
```

## 실행 방법

### 로컬에서 프론트엔드만 확인하기

1. 이 저장소를 클론합니다.
```bash
   git clone https://github.com/041211lhs/daylog.git
   cd daylog
```
2. `index.html`을 VS Code의 Live Server 확장 프로그램으로 열거나, 브라우저로 직접 엽니다.
   - 단, AI 하루 회고 기능은 서버리스 함수가 필요해서 로컬 정적 실행만으로는 동작하지 않습니다.

### Vercel에 배포하기

1. GitHub에 저장소를 push합니다.
2. [vercel.com](https://vercel.com)에서 **Add New → Project**로 이 저장소를 Import합니다.
3. Framework Preset은 **Other**로 둡니다.
4. 아래 [환경 변수 설정](#환경-변수-설정)을 등록합니다.
5. **Deploy**를 클릭합니다.

## 환경 변수 설정

Vercel 프로젝트 → **Settings → Environment Variables**에서 아래 3개를 등록해야 합니다. (`.env.example` 참고)

| Key | 설명 | 예시 값 |
|---|---|---|
| `OPENAI_API_KEY` | AI API 인증 키 | 발급받은 키 값 |
| `OPENAI_BASE_URL` | AI API 엔드포인트 주소 | `https://copa.codyssey.kr/v1` |
| `OPENAI_MODEL` | 사용할 모델명 | `gpt-5.4` |

> API 키는 절대 코드나 커밋 이력에 직접 작성하지 않고, 반드시 환경 변수로만 관리합니다.

## AI 기능 흐름

```
사용자가 오늘의 기록 입력
→ "AI 하루 회고 요청" 버튼 클릭
→ JavaScript fetch() → POST /api/reflect
→ Python 서버리스 함수가 AI API 호출
→ 응답(JSON) 반환
→ 화면에 요약 + 키워드 표시
```