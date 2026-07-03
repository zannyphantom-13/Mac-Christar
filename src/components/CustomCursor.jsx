import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [dotPosition, setDotPosition] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let requestRef;

    const onMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      setPosition({ x, y });
      if (hidden) setHidden(false);
    };

    const onMouseLeave = () => setHidden(true);
    const onMouseEnter = () => setHidden(false);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    const handleHoverStart = () => setHovered(true);
    const handleHoverEnd = () => setHovered(false);

    const attachHoverEvents = () => {
      document.querySelectorAll('a, button, input, select, .magnetic').forEach(el => {
        el.addEventListener('mouseenter', handleHoverStart);
        el.addEventListener('mouseleave', handleHoverEnd);
      });
    };

    attachHoverEvents();

    // Use MutationObserver to attach to dynamically added elements
    const observer = new MutationObserver(attachHoverEvents);
    observer.observe(document.body, { childList: true, subtree: true });

    // Smooth following for the outer ring
    const loop = () => {
      setDotPosition(prev => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        return {
          x: prev.x + dx * 0.15,
          y: prev.y + dy * 0.15
        };
      });
      requestRef = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      observer.disconnect();
      cancelAnimationFrame(requestRef);
      document.querySelectorAll('a, button, input, select, .magnetic').forEach(el => {
        el.removeEventListener('mouseenter', handleHoverStart);
        el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, [position, hidden]);

  if (typeof navigator !== 'undefined' && navigator.userAgent.match(/Android|iPhone|iPad|iPod/i)) {
    return null; // Disable on touch devices
  }

  return (
    <>
      <div 
        className={`custom-cursor-dot ${hidden ? 'hidden' : ''} ${hovered ? 'hovered' : ''}`}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      />
      <div 
        className={`custom-cursor-ring ${hidden ? 'hidden' : ''} ${hovered ? 'hovered' : ''}`}
        style={{ transform: `translate3d(${dotPosition.x}px, ${dotPosition.y}px, 0)` }}
      />
    </>
  );
}
