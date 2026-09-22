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
        if not api_key:
            self._send_json(500, {'error': 'AI 응답을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.'})
            return

        events_text = ", ".join(
            f"{ev.get('time', '')} {ev.get('title', '')}".strip() for ev in events
        ) if events else "없음"

        prompt = (
            "다음은 사용자가 하루를 기록한 내용입니다.\n\n"
            f"오늘의 일정: {events_text}\n"
            f"오늘의 기록: {journal}\n\n"
            "위 내용을 바탕으로 아래 JSON 형식으로만 응답하세요. 다른 설명은 절대 추가하지 마세요.\n"
            '{"summary": "2~4문장의 하루 요약", "keywords": ["키워드1", "키워드2", "키워드3"]}\n\n'
            "과도한 조언이나 심리 분석은 하지 말고, 담백하고 따뜻한 톤으로 작성하세요."
        )

        try:
            request_body = json.dumps({
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
            }).encode('utf-8')

            req = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
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