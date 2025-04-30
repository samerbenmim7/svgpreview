// hooks/useSpriteLoader.js
import { useEffect, useState } from 'react';
import { get } from '../services/api';

export function useSpriteLoader(url = '/icons/sprite.svg') {
  const [symbolCount, setSymbolCount] = useState(0);

  useEffect(() => {
    const fetchSprite = async () => {
      try {
        const { text } = await get(url);
        const div = document.createElement('div');
        div.style.display = 'none';
        div.innerHTML = text;
        document.body.prepend(div);

        const svg = div.querySelector('svg');
        const symbols = svg?.querySelectorAll('symbol') || [];
        setSymbolCount(symbols.length);
      } catch (err) {
        console.error('Failed to load sprite:', err);
      }
    };

    fetchSprite();
  }, [url]);

  return symbolCount;
}
