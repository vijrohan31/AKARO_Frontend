import { useState, useEffect } from 'react';

export function useAdaptiveDensity() {
  const [density, setDensity] = useState(10); 

  useEffect(() => {
    const updateDensity = () => {
      const width = window.innerWidth;
      if (width >= 1920) {
        setDensity(8); 
      } else if (width >= 1200) {
        setDensity(4); 
      } else if (width >= 768) {
        setDensity(6); 
      } else {
        setDensity(5); 
      }
    };

    updateDensity();
    window.addEventListener('resize', updateDensity);
    return () => window.removeEventListener('resize', updateDensity);
  }, []);

  return density;
}
