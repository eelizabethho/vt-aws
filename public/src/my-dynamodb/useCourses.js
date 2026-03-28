import { useState, useEffect } from 'react';
import { scanItems } from '../api/dynamodb';

const TABLE_NAME = 'vt-courses';

/**
 * Hook to load all courses from DynamoDB.
 *
 * Returns an object shaped like CLASS_DATABASE:
 * {
 *   'CS 1044': { title, credits, sections: [{ crn, location, startTime, endTime, days, instructor }] },
 *   ...
 * }
 */
export function useCourses() {
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);
        const items = await scanItems(TABLE_NAME);

        // Convert array of DynamoDB items → { courseId: { title, credits, sections } }
        const courseMap = {};
        for (const item of items) {
          courseMap[item.courseId] = {
            title: item.title,
            credits: item.credits,
            sections: item.sections || [],
          };
        }
        setCourses(courseMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return { courses, loading, error };
}
