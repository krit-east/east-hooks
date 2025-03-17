'use client';

import { useState, useCallback } from 'react';

interface RequestOptions {
  Load?: boolean; 
  alert?: boolean;
  headers?: Record<string, string>; 
  result?: (data: any) => void; 
}

/**
 * Trigger the API request
 *
 * @param data - Payload data for the request
 * @param method - HTTP method (e.g., GET, POST, PUT, DELETE)
 * @param url - API endpoint
 * @param options - Additional options for the request
 * @returns Promise<any> - API response data
 */
export const trigger = async <T,>(
  data: T,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  options: RequestOptions = {}
): Promise<T> => {
  let requestBody: any;
  let requestHeaders: Record<string, string> = options.headers || {};

  if (method !== 'GET' && data) {
    if (data instanceof FormData) {
      requestBody = data;
    } else {
      requestBody = JSON.stringify(data);
      requestHeaders = {
        'Content-Type': 'application/json',
        ...requestHeaders,
      };
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
    });
    const result = await response.json();

    if (options.result && typeof options.result === 'function') {
      options.result(result);
    }

    return result as T;
  } catch (error: any) {
    throw new Error(error.message || 'Something went wrong');
  }
};

/**
 * Custom hook for API requests with loading state
 * 
 * @returns A tuple containing trigger function, loading state, and error state
 */
export const useRequest = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const request = useCallback(async <T,>(
    data: any,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    options: RequestOptions = {}
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // If Load option is set, call it with loading state
      if (options.Load) {
        options.result?.(true);
      }
      
      const result = await trigger<T>(data, method, url, options);
      
      // If Load option is set, call it with loading state
      if (options.Load) {
        options.result?.(false);
      }
      
      return result;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'Request failed'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
};

export default useRequest;
