// client/src/lib/api.js

/**
 * Creates a new paste
 * @param {string} content - The text content
 * @param {number|null} ttl - TTL in seconds (optional)
 * @param {number|null} maxViews - Max views (optional)
 */
export async function createPaste(content, ttl, maxViews) {
  const payload = { content };
  
  if (ttl) payload.ttl_seconds = parseInt(ttl);
  if (maxViews) payload.max_views = parseInt(maxViews);

  const res = await fetch('/api/pastes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create paste');
  }

  return res.json();
}

/**
 * Fetches a paste by ID
 * @param {string} id 
 */
export async function getPaste(id) {
  const res = await fetch(`/api/pastes/${id}`);
  
  if (res.status === 404) {
    throw new Error('Paste not found or expired'); // Specific 404 handling
  }
  
  if (!res.ok) {
    throw new Error('Failed to load paste');
  }

  return res.json();
}