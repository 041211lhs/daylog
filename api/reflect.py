from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request
import urllib.error


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else b'{}'

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            data = {}

        journal = (data.get('journal') or '').strip()
        events = data.get('events') or []

        # 1) 빈 입력 처리
        if not journal:
            self._send_json(400, {'error': '오늘의 기록을 먼저 작성해주세요.'})
            return

        api_key = os.environ.get('OPENAI_API_KEY')
        base_url = os.environ.get('OPENAI_BASE_URL', 'https://api.openai.com/v1')
        model = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')

        if not api_key:
            self._send_json(500, {'error': 'AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.'})
            return

        events_text = ", ".join(
            f"{ev.get('time', '')} {ev.get('title', '')}".strip() for ev in events
        ) if events else "없음"
        
        prompt = (
            "너는 사용자의 하루 기록을 읽고 회고를 도와주는 다정한 친구야.\n\n"
                f"오늘의 일정: {events_text}\n"
                f"오늘의 기록: {journal}\n\n"
                "아래 원칙을 지켜서 회고를 작성해줘:\n"
                "1. 사용자가 쓴 문장을 그대로 요약하거나 바꿔 말하지 말고, 기록 속에서 드러나는 하루의 흐름이나 느낌을 짚어줘.\n"
                "   예: 그냥 있었던 일을 나열하지 말고, 그 하루가 어땠는지에 대한 짧은 관찰을 담아줘.\n"
                "2. 일정과 기록을 연결지어서 하루 전체의 맥락을 보여줘. (예: 바빴던 하루였는지, 여유로웠는지, 성취감이 있었는지 등)\n"
                "3. 조언이나 심리 분석, 평가는 하지 마. 관찰과 공감 정도로만 표현해.\n"
                "4. 따뜻하지만 담백한 톤을 유지하고, 과장하지 마.\n\n"
                "아래 JSON 형식으로만 응답하고, 다른 설명은 절대 추가하지 마.\n"
                '{"summary": "2~4문장의 하루 회고", "keywords": ["키워드1", "키워드2", "키워드3"]}'
        )

        try:
            request_body = json.dumps({
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
            }).encode('utf-8')

            req = urllib.request.Request(
                f"{base_url.rstrip('/')}/chat/completions",
                data=request_body,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                method="POST",
            )

            # 2) 지연/타임아웃 대비: 15초 제한
            with urllib.request.urlopen(req, timeout=15) as response:
                result = json.loads(response.read().decode('utf-8'))

            ai_text = result['choices'][0]['message']['content'].strip()
            ai_text = ai_text.replace('```json', '').replace('```', '').strip()
            parsed = json.loads(ai_text)

            if 'summary' not in parsed or 'keywords' not in parsed:
                raise ValueError('unexpected AI response shape')

            self._send_json(200, parsed)

        except Exception:
            # 3) API 오류 처리 (타임아웃 포함)
            self._send_json(502, {'error': 'AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.'})

    def _send_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(payload, ensure_ascii=False).encode('utf-8'))