// hooks/useCenterScroll.ts
import { useEffect } from 'react';

export function useCenterScroll(ref: React.RefObject<HTMLDivElement|null>, trigger: any) {
  useEffect(() => {
    if (ref.current) {
      const el = ref.current;
      const centerX = (el.scrollWidth - el.clientWidth) / 2;
      const centerY = (el.scrollHeight - el.clientHeight) / 2;
      el.scrollTo({ left: centerX, top: centerY, behavior: 'smooth' });
    }
  }, [trigger]);
}
