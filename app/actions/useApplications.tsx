import { useState, useEffect } from 'react';

interface Application {
  id: string;
  name: string;
  status: string;
}

const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applications');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data: Application[] = await response.json();
        const approvedApplications = data.filter(application => application.status === 'approved');
        setApplications(approvedApplications);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return { applications, loading, error };
};

export default useApplications;