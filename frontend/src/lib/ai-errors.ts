export const getAiConfigErrorMessage = (message?: string | null): string | null => {
  if (!message) {
    return null;
  }

  const match = message.match(/AI service not configured\. Check ([A-Z0-9_,\s]+)/i);
  if (match?.[1]) {
    return `AI service not configured. Check ${match[1].trim()}`;
  }

  if (message.toLowerCase().includes('ai service not configured')) {
    return 'AI service not configured. Check GROQ_API_KEY.';
  }

  return null;
};
