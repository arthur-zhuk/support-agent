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
  
  let sessionId = localStorage.getItem('support-agent-session') || 'session-' + Date.now();
  localStorage.setItem('support-agent-session', sessionId);
  
  let conversationHistory = [];

  async function loadHistory() {
    try {
      const response = await fetch(config.apiUrl + '/chat/history?tenantId=' + config.tenantId + '&sessionId=' + sessionId);
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          conversationHistory = data.messages;
          renderMessages(data.messages);
        }
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }

  function renderMessages(msgs) {
    messages.innerHTML = '';
    msgs.forEach(msg => {
      if (msg.role === 'user') {
        const userMsg = document.createElement('div');
        userMsg.style.cssText = 'margin-bottom: 12px; text-align: right;';
        userMsg.innerHTML = \`<div style="display: inline-block; background: #0070f3; color: white; padding: 8px 12px; border-radius: 12px; max-width: 80%;">\${escapeHtml(msg.content)}</div>\`;
        messages.appendChild(userMsg);
      } else if (msg.role === 'assistant') {
        const assistantMsg = document.createElement('div');
        assistantMsg.style.cssText = 'margin-bottom: 12px;';
        assistantMsg.innerHTML = \`<div style="display: inline-block; background: #f5f5f5; padding: 8px 12px; border-radius: 12px; max-width: 80%;">\${escapeHtml(msg.content)}</div>\`;
        messages.appendChild(assistantMsg);
      }
    });
    messages.scrollTop = messages.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  toggle.addEventListener('click', () => {
    const isOpen = chat.style.display !== 'none';
    chat.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen && conversationHistory.length === 0) {
      loadHistory();
    }
  });

  async function sendMessage(text) {
    if (!text.trim()) return;
    
    input.disabled = true;
    const userMsg = document.createElement('div');
    userMsg.style.cssText = 'margin-bottom: 12px; text-align: right;';
    userMsg.innerHTML = \`<div style="display: inline-block; background: #0070f3; color: white; padding: 8px 12px; border-radius: 12px; max-width: 80%;">\${escapeHtml(text)}</div>\`;
    messages.appendChild(userMsg);
    messages.scrollTop = messages.scrollHeight;

    conversationHistory.push({ role: 'user', content: text });

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
          try {
            const data = JSON.parse(line.slice(2));
            if (data.type === 'text-delta') {
              contentDiv.textContent += data.textDelta;
              messages.scrollTop = messages.scrollHeight;
            }
          } catch (e) {
            console.error('Failed to parse stream data:', e);
          }
        }
      }
    }
    
    const finalText = contentDiv.textContent;
    conversationHistory.push({ role: 'assistant', content: finalText });
    input.disabled = false;
    input.focus();
  }

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim() && !input.disabled) {
      sendMessage(input.value);
      input.value = '';
    }
  });
  
  loadHistory();
})();
`

  return new NextResponse(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
    },
  })
}

