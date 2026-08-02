import React, { useState, useEffect } from 'react';

/**
 * TypewriterText — Types out text character-by-character with a typewriter cursor
 */
export default function TypewriterText({
  text = '',
  speed = 22,
  delay = 0,
  className = '',
  as: Component = 'span',
  showCursor = true,
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;
    let timeoutId = null;

    const startTimeout = setTimeout(() => {
      const intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(intervalId);
          setIsTyping(false);
        }
      }, speed);

      timeoutId = intervalId;
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      if (timeoutId) clearInterval(timeoutId);
    };
  }, [text, speed, delay]);

  return (
    <Component className={`inline-flex flex-wrap items-center justify-center ${className}`} dir="rtl">
      <span>{displayedText}</span>
      {showCursor && isTyping && (
        <span
          className="inline-block text-cyan-600 dark:text-cyan-400 animate-pulse font-mono text-sm font-semibold mx-0.5 select-none"
          style={{ unicodeBidi: 'embed' }}
        >
          |
        </span>
      )}
    </Component>
  );
}
