import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';

const defaultRect = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
};

const PopoverContext = React.createContext({
  isShow: false,
  setIsShow: () => {
    throw new Error('PopoverContext setIsShow should be used under provider');
  },
  preferredPosition: 'bottom-center',
  triggerRect: defaultRect,
  setTriggerRect: () => {
    throw new Error('PopoverContext setTriggerRect should be used under provider');
  },
});

export default function Popover({
  children,
  preferredPosition = 'bottom-center',
}) {
  const [isShow, setIsShow] = useState(false);
  const [triggerRect, setTriggerRect] = useState(defaultRect);

  const contextValue = {
    isShow,
    setIsShow,
    preferredPosition,
    triggerRect,
    setTriggerRect,
  };

  return (
    <PopoverContext.Provider value={contextValue}>
      {children}
    </PopoverContext.Provider>
  );
}

function Trigger({ children }) {
  const { setIsShow, setTriggerRect } = useContext(PopoverContext);

  const ref = useRef(null);

  const onClick = (e) => {
    const element = ref.current;
    if (element == null) {
      return;
    }

    const rect = element.getBoundingClientRect();
    setTriggerRect(rect);
    setIsShow((isShow) => !isShow);
  };

  const childrenToTriggerPopover = React.cloneElement(children, {
    onClick,
    ref,
  });

  return childrenToTriggerPopover;
}

function Content({ children }) {
  const { isShow } = useContext(PopoverContext);

  if (!isShow) {
    return null;
  }

  return <ContentInternal>{children}</ContentInternal>;
}

function ContentInternal({ children }) {
  const { triggerRect, preferredPosition, setIsShow } =
    useContext(PopoverContext);
  const ref = useRef(null);
  const [coords, setCoords] = useState({
    left: 0,
    top: 0,
  });

  useLayoutEffect(() => {
    const element = ref.current;
    if (element == null) {
      return;
    }

    const rect = element.getBoundingClientRect();

    const coords = getPopoverCoords(triggerRect, rect, preferredPosition);
    setCoords(coords);
  }, []);

  const refFocusTrapping = useFocusTrapping();

  const dismiss = useCallback(() => {
    setIsShow(false);
  }, []);
  const refClickOutside = useClickOutside(dismiss);

  const mergedRef = mergeRef(ref, refFocusTrapping, refClickOutside);
  return (
    <dialog
      open={true}
      ref={mergedRef}
      style={{
        position: 'fixed',
        left: `${coords.left}px`,
        top: `${coords.top}px`,
        margin: 0,
      }}
    >
      {children}
    </dialog>
  );
}

function Close({ children }) {
  const { setIsShow } = useContext(PopoverContext);
  const onClick = (e) => {
    setIsShow(false);
    e.stopPropagation();
  };
  const childrenToClosePopover = React.cloneElement(children, {
    onClick,
  });

  return childrenToClosePopover;
}

Popover.Trigger = Trigger;
Popover.Content = Content;
Popover.Close = Close;

function getPopoverCoords(
  triggerRect,
  popoverRect,
  position
) {
  switch (position) {
    case 'bottom-center':
    default:
      let top = triggerRect.top + triggerRect.height + 10;
      let left = Math.max(
        triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2,
        10
      );

      if (top + popoverRect.height > window.innerHeight - 10) {
        top = triggerRect.top - 10 - popoverRect.height;
      }
      return {
        top,
        left,
      };
  }
}

const focusableQuery = ':is(input, button, [tab-index]';

function useFocusTrapping() {
  const refTrigger = useRef(document.activeElement);
  const ref = useRef(null);

  const onKeyDown = useCallback((e) => {
    const popover = ref.current;
    if (popover == null) {
      return;
    }
    const focusables = [...popover.querySelectorAll(focusableQuery)];

    switch (e.key) {
      case 'Tab':
        const lastFocusable = focusables[focusables.length - 1];
        if (document.activeElement === lastFocusable) {
          focusables[0]?.focus();
          e.preventDefault();
        }
    }
  }, []);

  useEffect(() => {
    const popover = ref.current;
    if (popover == null) {
      return;
    }

    const focusables = [...popover.querySelectorAll(focusableQuery)];
    focusables[0]?.focus();

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);

      const trigger = refTrigger.current;
      const currentActiveElement = document.activeElement;
      if (currentActiveElement == document.body) {
        trigger?.focus();
      }
    };
  }, []);

  return ref;
}

function mergeRef(...refs) {
  return (el) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(el);
      } else {
        ref.current = el;
      }
    });
  };
}

function useClickOutside(callback) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return;
    }

    const onClick = (e) => {
      if (!element.contains(e.target)) {
        console.log('clicked outside');
        callback();
      }
    };

    window.setTimeout(() => document.addEventListener('click', onClick), 0);
    return () => {
      window.setTimeout(() => document.removeEventListener('click', onClick), 0);
    };
  }, []);
  return ref;
}
