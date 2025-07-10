import { useState, useCallback } from 'react';

interface PerformanceResult {
  cacheTime: number;
  networkTime: number;
  improvement: number;
  improvementPercentage: number;
}

export const usePerformanceTest = () => {
  const [results, setResults] = useState<PerformanceResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runPerformanceTest = useCallback(async (
    testFunction: (forceRefresh: boolean) => Promise<void>
  ) => {
    setIsRunning(true);
    
    try {
      // Medir tiempo con caché
      const cacheStart = performance.now();
      await testFunction(false); // Usar caché
      const cacheEnd = performance.now();
      const cacheTime = cacheEnd - cacheStart;

      // Esperar un poco para evitar interferencia
      await new Promise(resolve => setTimeout(resolve, 100));

      // Medir tiempo con network (forzar refresh)
      const networkStart = performance.now();
      await testFunction(true); // Forzar network
      const networkEnd = performance.now();
      const networkTime = networkEnd - networkStart;

      // Calcular mejora
      const improvement = networkTime - cacheTime;
      const improvementPercentage = ((improvement / networkTime) * 100);

      const result: PerformanceResult = {
        cacheTime,
        networkTime,
        improvement,
        improvementPercentage
      };

      setResults(result);
      
      // Log para debugging
      console.log('🚀 Performance Test Results:', {
        'Cache Time': `${cacheTime.toFixed(2)}ms`,
        'Network Time': `${networkTime.toFixed(2)}ms`,
        'Improvement': `${improvement.toFixed(2)}ms (${improvementPercentage.toFixed(1)}% faster)`
      });

    } catch (error) {
      console.error('Error running performance test:', error);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return {
    results,
    isRunning,
    runPerformanceTest,
    formatTime,
    clearResults: () => setResults(null)
  };
}; 