import React, { useEffect, useRef } from "react";

const Popover = ({ onClick, children }) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const pageClickEvent = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClick();
      }
    };

    document.addEventListener("click", pageClickEvent);

    return () => {
      document.removeEventListener("click", pageClickEvent);
    };
  }, [onClick]);

  return <div ref={popoverRef}>{children}</div>;
};

export default Popover;
