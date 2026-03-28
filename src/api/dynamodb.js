const API_URL = 'http://localhost:3001/api';

export async function getItem(tableName, id) {
  const response = await fetch(`${API_URL}/items/${tableName}/${id}`);
  if (!response.ok) throw new Error('Failed to fetch item');
  return response.json();
}

export async function putItem(tableName, item) {
  const response = await fetch(`${API_URL}/items/${tableName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error('Failed to save item');
  return response.json();
}

export async function scanItems(tableName, limit) {
  const url = limit ? `${API_URL}/items/${tableName}?limit=${limit}` : `${API_URL}/items/${tableName}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to scan items');
  return response.json();
}

export async function queryItems(tableName, keyConditionExpression, expressionAttributeValues) {
  const response = await fetch(`${API_URL}/query/${tableName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyConditionExpression, expressionAttributeValues }),
  });
  if (!response.ok) throw new Error('Failed to query items');
  return response.json();
}
