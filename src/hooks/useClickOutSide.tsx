    import { useEffect, useRef } from "react";

    type Callback = (event: MouseEvent) => void;

    function useClickOutside<T extends HTMLElement = HTMLElement>(callback: Callback) {
      const ref = useRef<T>(null);
      const savedCallback = useRef(callback);

      useEffect(() => {
        savedCallback.current = callback;
      }, [callback]);

      useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (ref.current && !ref.current.contains(event.target as Node)) {
            savedCallback.current(event);
          }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, []);

      return ref;
    }

    export default useClickOutside;