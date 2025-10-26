import { useEffect, useRef, useState } from "react"

const useDimension = <T extends HTMLElement>() => {
    const ref = useRef<T | null>(null);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;

        const observer = new ResizeObserver(([entry]) => {
            if (entry.contentRect) {
                setWidth(entry.contentRect.width);
                setHeight(entry.contentRect.height);
            }
        });

        observer.observe(element);

        setWidth(element.offsetWidth);
        setHeight(element.offsetHeight);

        return () => {
            observer.disconnect();
        };
    }, []);

    return { ref, width, height };
}

export default useDimension;