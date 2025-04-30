// useDeleteKey.js
import { useEffect } from 'react';

export function useKeyboard(key,callback) {
  useEffect(() => {
    
    const handleKeyDown = (e) => {
      if (e.key === key) {
        callback();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}
