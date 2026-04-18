export type DisplayField = {
    value: string;
    isAiFallback: boolean;
};

const normalizeDisplayValue = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed || "";
};

export const getPrimaryWithAiFallback = (
    primary?: string | null,
    aiFallback?: string | null,
): DisplayField => {
    const primaryValue = normalizeDisplayValue(primary);
    if (primaryValue) {
        return {
            value: primaryValue,
            isAiFallback: false,
        };
    }

    const fallbackValue = normalizeDisplayValue(aiFallback);
    return {
        value: fallbackValue,
        isAiFallback: Boolean(fallbackValue),
    };
};
