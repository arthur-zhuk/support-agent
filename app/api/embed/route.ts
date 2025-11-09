import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const tenantId = searchParams.get('tenantId')

  if (!tenantId) {
    return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 })
  }

  const token = await new SignJWT({ tenantId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  const widgetScript = `
(function() {
  const script = document.currentScript;
  const config = {
    tenantId: '${tenantId}',
    token: '${token}',
    apiUrl: '${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api',
  };

  const widget = document.createElement('div');
  widget.id = 'support-agent-widget';
  widget.innerHTML = \`
    <div style="position: fixed; bottom: 20px; right: 20px; z-index: 10000;">
      <button id="support-agent-toggle" style="
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #0070f3;
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 24px;
      ">💬</button>
      <div id="support-agent-chat" style="
        display: none;
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        flex-direction: column;
      ">
        <div style="padding: 16px; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Support</div>
        <div id="support-agent-messages" style="flex: 1; overflow-y: auto; padding: 16px;"></div>
        <div style="padding: 16px; border-top: 1px solid #e5e5e5;">
          <input id="support-agent-input" type="text" placeholder="Type your message..." style="
            width: 100%;
            padding: 12px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            outline: none;
          " />
        </div>
      </div>
    </div>
  \`;
  document.body.appendChild(widget);

  const toggle = document.getElementById('support-agent-toggle');
  const chat = document.getElementById('support-agent-chat');
  const messages = document.getElementById('support-agent-messages');
  const input = document.getElementById('support-agent-input');
  let sessionId = 'session-' + Date.now();

  toggle.addEventListener('click', () => {
    chat.style.display = chat.style.display === 'none' ? 'flex' : 'none';
  });

  async function sendMessage(text) {
    const userMsg = document.createElement('div');
    userMsg.style.cssText = 'margin-bottom: 12px; text-align: right;';
    userMsg.innerHTML = \`<div style="display: inline-block; background: #0070f3; color: white; padding: 8px 12px; border-radius: 12px;">\${text}</div>\`;
    messages.appendChild(userMsg);
    messages.scrollTop = messages.scrollHeight;

    const response = await fetch(config.apiUrl + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: config.tenantId,
        sessionId: sessionId,
        messages: [{ role: 'user', content: text }],
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const assistantMsg = document.createElement('div');
    assistantMsg.style.cssText = 'margin-bottom: 12px;';
    assistantMsg.innerHTML = '<div style="display: inline-block; background: #f5f5f5; padding: 8px 12px; border-radius: 12px;"></div>';
    messages.appendChild(assistantMsg);
    const contentDiv = assistantMsg.querySelector('div');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('0:')) {
          const data = JSON.parse(line.slice(2));
          if (data.type === 'text-delta') {
            contentDiv.textContent += data.textDelta;
            messages.scrollTop = messages.scrollHeight;
          }
        }
      }
    }
  }

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      sendMessage(input.value);
      input.value = '';
    }
  });
})();
`

  return new NextResponse(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  })
}

