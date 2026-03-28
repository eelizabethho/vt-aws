import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:3001/api';

/**
 * Hook to save and load a student's schedule from DynamoDB.
 *
 * Usage:
 *   const { saveSchedule, loadSchedule, saving, loading } = useScheduleStorage(user);
 *
 * Stored in DynamoDB table "student-schedules":
 *   { userId, email, name, schedule: [...sections], savedAt }
 */
export function useScheduleStorage(user) {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const saveSchedule = useCallback(async (schedule) => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/schedules/${user.userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          email: user.email,
          name: user.name,
          schedule,
          savedAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to save schedule');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [user]);

  const loadSchedule = useCallback(async () => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/schedules/${user.userId}`);
      if (!response.ok) throw new Error('Failed to load schedule');
      const data = await response.json();
      return data?.schedule ?? null;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { saveSchedule, loadSchedule, saving, loading, error };
}
