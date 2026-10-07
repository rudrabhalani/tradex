const API_BASE = '/api';

export async function analyzeChart(file, message, conversationHistory) {
  const formData = new FormData();
  formData.append('chart', file);
  if (message) {
    formData.append('message', message);
  }
  if (conversationHistory && conversationHistory.length > 0) {
    formData.append('conversationHistory', JSON.stringify(conversationHistory));
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

export async function chatFollowUp(message, conversationHistory) {
  const response = await fetch(`${API_BASE}/analysis/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, conversationHistory }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Failed to get response');
  }

  return response.json();
}

export async function healthCheck() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}
