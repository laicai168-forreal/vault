import { useEffect, useState, useCallback } from "react";

type CountdownOptions = {
    duration: number;
    storage?: Storage;
};

export function usePersistentCountdown(
    key: string,
    options: CountdownOptions
) {
    const { duration, storage = localStorage } = options;

    const getRemaining = useCallback(() => {
        const raw = storage.getItem(key);
        if (!raw) return 0;

        const endAt = Number(raw);
        if (Number.isNaN(endAt)) return 0;

        return Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    }, [key, storage]);

    const [secondsLeft, setSecondsLeft] = useState<number>(getRemaining);

    useEffect(() => {
        if (secondsLeft <= 0) return;

        const id = setInterval(() => {
            setSecondsLeft(getRemaining());
        }, 1000);

        return () => clearInterval(id);
    }, [secondsLeft, getRemaining]);

    const start = useCallback(
        (overrideDuration?: number) => {
            const seconds = overrideDuration ?? duration;
            const endAt = Date.now() + seconds * 1000;

            storage.setItem(key, String(endAt));
            setSecondsLeft(seconds);
        },
        [key, duration, storage]
    );

    const clear = useCallback(() => {
        storage.removeItem(key);
        setSecondsLeft(0);
    }, [key, storage]);

    return {
        secondsLeft,
        isActive: secondsLeft > 0,
        canStart: secondsLeft === 0,
        start,
        clear,
    };
}