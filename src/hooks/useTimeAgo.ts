import { useState, useEffect } from 'react';

export function useTimeAgo(date: Date): string {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    const calculateTimeAgo = () => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return "À l'instant";
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Il y a ${minutes} min`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Il y a ${hours}h`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `Il y a ${days}j`;
      } else {
        return date.toLocaleDateString('fr-MG', {
          day: 'numeric',
          month: 'short'
        });
      }
    };

    setTimeAgo(calculateTimeAgo());

    const interval = setInterval(() => {
      setTimeAgo(calculateTimeAgo());
    }, 60000);

    return () => clearInterval(interval);
  }, [date]);

  return timeAgo;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('fr-MG', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-MG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
