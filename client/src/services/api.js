const API_BASE = '/api';

export async function analyzeChart(file, message, conversationHistory, user = null) {
  const formData = new FormData();
  formData.append('chart', file);
  if (message) {
    formData.append('message', message);
  }
  if (conversationHistory && conversationHistory.length > 0) {
    formData.append('conversationHistory', JSON.stringify(conversationHistory));
  }
  if (user) {
    formData.append('userId', user.id || '');
    formData.append('userName', user.name || '');
  }

  const response = await fetch(`${API_BASE}/analysis/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Failed to analyze chart');
  }

  return response.json();
}

export async function chatFollowUp(message, conversationHistory, user = null) {
  const payload = { message, conversationHistory };
  if (user) {
    payload.userId = user.id;
    payload.userName = user.name;
  }

  const response = await fetch(`${API_BASE}/analysis/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Failed to get response');
  }

  return response.json();
}

export async function trackUser(userData) {
  try {
    const response = await fetch(`${API_BASE}/owner/track-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  } catch (err) {
    console.warn('Track user background error:', err);
    return { success: false };
  }
}

export async function ownerLogin(pin) {
  const response = await fetch(`${API_BASE}/owner/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pin }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to authenticate owner');
  }

  return data;
}

export async function getOwnerStats(token) {
  const response = await fetch(`${API_BASE}/owner/stats`, {
    headers: {
      'x-owner-token': token,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch owner analytics');
  }

  return data.data;
}

export async function healthCheck() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}
