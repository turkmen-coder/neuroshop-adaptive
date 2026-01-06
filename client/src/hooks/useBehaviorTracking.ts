import { useEffect, useRef, useState } from 'react';
import { nanoid } from 'nanoid';

interface BehaviorMetrics {
  sessionId: string;
  avgClickSpeed: number;
  totalClicks: number;
  impulsiveClicks: number;
  avgScrollSpeed: number;
  maxScrollDepth: number;
  avgDwellTime: number;
  pagesVisited: number;
  searchTerms: string[];
}

/**
 * Hook for tracking user behavior to infer personality traits
 * Tracks: click patterns, scroll behavior, dwell time, navigation
 */
export function useBehaviorTracking() {
  const [sessionId] = useState(() => nanoid());
  const metricsRef = useRef<BehaviorMetrics>({
    sessionId,
    avgClickSpeed: 0,
    totalClicks: 0,
    impulsiveClicks: 0,
    avgScrollSpeed: 0,
    maxScrollDepth: 0,
    avgDwellTime: 0,
    pagesVisited: 0,
    searchTerms: [],
  });

  const lastClickTimeRef = useRef<number>(0);
  const clickTimesRef = useRef<number[]>([]);
  const pageEnterTimeRef = useRef<number>(Date.now());
  const lastScrollTimeRef = useRef<number>(Date.now());
  const lastScrollYRef = useRef<number>(0);
  const scrollSpeedsRef = useRef<number[]>([]);

  useEffect(() => {
    // Track clicks
    const handleClick = (e: MouseEvent) => {
      const now = Date.now();
      metricsRef.current.totalClicks++;

      // Calculate click speed
      if (lastClickTimeRef.current > 0) {
        const timeDiff = (now - lastClickTimeRef.current) / 1000; // seconds
        clickTimesRef.current.push(timeDiff);

        // Impulsive click: less than 0.5 seconds between clicks
        if (timeDiff < 0.5) {
          metricsRef.current.impulsiveClicks++;
        }

        // Update average click speed
        const avgTime = clickTimesRef.current.reduce((a, b) => a + b, 0) / clickTimesRef.current.length;
        metricsRef.current.avgClickSpeed = 1 / avgTime; // clicks per second
      }

      lastClickTimeRef.current = now;
    };

    // Track scroll behavior
    const handleScroll = () => {
      const now = Date.now();
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;

      // Update max scroll depth
      metricsRef.current.maxScrollDepth = Math.max(
        metricsRef.current.maxScrollDepth,
        scrollDepth
      );

      // Calculate scroll speed
      if (lastScrollTimeRef.current > 0 && lastScrollYRef.current !== scrollY) {
        const timeDiff = (now - lastScrollTimeRef.current) / 1000; // seconds
        const distDiff = Math.abs(scrollY - lastScrollYRef.current);
        const speed = distDiff / timeDiff; // pixels per second

        scrollSpeedsRef.current.push(speed);

        // Update average scroll speed
        const avgSpeed = scrollSpeedsRef.current.reduce((a, b) => a + b, 0) / scrollSpeedsRef.current.length;
        metricsRef.current.avgScrollSpeed = avgSpeed;
      }

      lastScrollTimeRef.current = now;
      lastScrollYRef.current = scrollY;
    };

    // Track page dwell time
    const updateDwellTime = () => {
      const now = Date.now();
      const dwellTime = (now - pageEnterTimeRef.current) / 1000; // seconds
      metricsRef.current.avgDwellTime = dwellTime;
    };

    // Set up event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll, { passive: true });

    // Update dwell time every 5 seconds
    const dwellInterval = setInterval(updateDwellTime, 5000);

    // Track page visit
    metricsRef.current.pagesVisited++;

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      clearInterval(dwellInterval);
      updateDwellTime(); // Final update
    };
  }, []);

  // Add search term
  const addSearchTerm = (term: string) => {
    if (term && !metricsRef.current.searchTerms.includes(term)) {
      metricsRef.current.searchTerms.push(term);
    }
  };

  // Get current metrics
  const getMetrics = (): BehaviorMetrics => {
    return { ...metricsRef.current };
  };

  return {
    sessionId,
    addSearchTerm,
    getMetrics,
  };
}
