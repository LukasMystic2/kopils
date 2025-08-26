import { useState, useEffect } from 'react';

const useFetch = (url, token = null, isProtected = false) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            // If the route is protected and there's no token, don't fetch.
            if (isProtected && !token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(url, { headers });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Data could not be fetched.');
                }
                const jsonData = await response.json();
                
                if (isMounted) {
                    setData(jsonData);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        
        return () => {
            isMounted = false;
        };

    }, [url, token, isProtected]);

    return { data, loading, error, setData }; // Expose setData for real-time updates
};

export default useFetch;
