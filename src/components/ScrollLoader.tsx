import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import ScrollItem from './ScrollItem';
import './ScrollLoader.scss'
import useDimension from '../hooks/useDimension';
import useWindowSize from '../hooks/useWindowSize';

const MOCKLOCATION_NAMES = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Federated States of Micronesia', 'Florida', 'Georgia', 'Guam', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Marshall Islands', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Island', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']

interface ScrollItem {
    id: string;
    height: number;
    width: number;
    translateX: number;
    translateY: number;
    top: number;
    bottom: number;
    itemId: string;
    image: string;
    shortDescription: string;
    price: number;
    visible: boolean;
    location: string;
}

type ScrollLoaderProps = {
    items?: ScrollItem[];
    pendingRequest?: Promise<ScrollItem[]>;
    margin?: number;
    bufferSize?: number;
    optimizeByVisibility?: boolean;
    bufferScreenAreaHeight?: number;
}

const COLUMN_COUNT_BY_WINDOW_WIDTH = new Map([
    [1400, 5],
    [1145, 4],
    [768, 3],
])

const ScrollLoader = ({
    margin = 16,
    items = [],
    bufferSize = 16,
    optimizeByVisibility = false,
    bufferScreenAreaHeight = 300,
}: ScrollLoaderProps) => {
    const mediumWidth = useMemo(() => 275 + margin, [margin]);
    const [scrollTop, setScrollTop] = useState(0);
    const [scrollBottom, setScrollBottom] = useState(0);
    const [topBoundary, setTopBoundary] = useState(0);
    const [bottomBoundary, setBottomBoundary] = useState(0);
    const [localItems, setLocalItems] = useState<ScrollItem[]>(items);
    const [calculatedItems, setCalculatedItems] = useState<ScrollItem[]>(items);
    const [visibleItems, setVisibleItems] = useState<ScrollItem[]>(items)
    const [croppedItems, setCroppedItems] = useState<ScrollItem[]>(items);
    const [colCount, setColCount] = useState<number>(1);
    const [offset, setOffset] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const [columnBottoms, setColumnBottoms] = useState(new Map())
    const [minColumnWidth, setMinColumnWidth] = useState(1);
    const [shouldAlignItems, setShouldAlignItems] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [itemRequests, setItemRequests] = useState<null | Promise<ScrollItem[]>>(null)

    type OrderedBottom = {
        id: string;
        bottom: number;
    }
    const orderedBottom = useRef<OrderedBottom[] | null>(null);

    const { ref, width, height } = useDimension<HTMLDivElement>()
    const { height: windowHeight } = useWindowSize();

    const generateMockItems = (): ScrollItem[] => {
        return Array.from({ length: bufferSize }, () => ({
            height: Math.random() * 100 + 300,
            width: Math.random() * 100 + 275,
            id: Math.random().toString(36).substring(2, 9),
            shortDescription: `It is ${Math.random().toString(36).substring(2, 9)}`,
            location: MOCKLOCATION_NAMES[Math.floor(Math.random() * 50)],
            price: Math.floor(Math.random() * 20000) / 100,
            image: `https://picsum.photos/id/${Math.floor(Math.random() * 300)}/${Math.floor(Math.random() * 100 + 500)}/${Math.floor(Math.random() * 100 + 475)}`
        } as ScrollItem));
    }

    const generateBufferItems = (length: number): ScrollItem[] => {
        return Array.from({ length }, () => ({
            height: 400,
            width: 275,
        } as ScrollItem));
    }

    const updateColumnCount = (width: number, currentColCount: number) => {
        let largestMatchingWidth = 0;
        let newColCount = currentColCount;
        COLUMN_COUNT_BY_WINDOW_WIDTH.forEach((value, key) => {
            if (key > largestMatchingWidth && width > key) {
                newColCount = value;
                largestMatchingWidth = key;
            }
        });

        if (newColCount !== currentColCount) setColCount(newColCount);
        if (largestMatchingWidth === 0) setColCount(2);
    }

    const alignItems = useCallback(() => {
        clearBottomPositionData();

        const bottoms = new Map();
        let nextCol = 0;

        for (let i = 0; i < colCount; i++) {
            bottoms.set(i, 0);
        }

        const itemWidth = (width + margin) / colCount - margin;
        setContainerHeight(1);

        let longest = 0;

        const calculatedItems = localItems.map((item, index) => {
            item.translateX = nextCol === 0 ? 0 : nextCol * itemWidth + nextCol * margin;
            item.translateY = bottoms.get(nextCol);
            item.top = bottoms.get(nextCol);
            item.bottom = bottoms.get(nextCol) + item.height;
            item.width = itemWidth;
            item.itemId = `${index}`;
            bottoms.set(nextCol, bottoms.get(nextCol) + item.height + margin);
            let shortest = Infinity;

            bottoms.forEach((value, key) => {
                if (value < shortest) {
                    shortest = value;
                    nextCol = key;
                }
                if (value > longest) {
                    longest = value;
                }
            });

            return item;
        });

        setContainerHeight(longest);
        setBottomBoundary(bottoms.get(nextCol));
        setColumnBottoms(bottoms);
        setCalculatedItems([...calculatedItems]);
    }, [width, colCount, localItems])

    const clearBottomPositionData = () => {
        orderedBottom.current = [];
    }

    const updateBottomPositionData = (bottom: number, id: string) => {
        const curBottoms = orderedBottom.current;
        if (!curBottoms || !curBottoms.length) {
            orderedBottom.current = [{ id, bottom }]
        } else {
            if (bottom >= curBottoms[curBottoms.length - 1].bottom) {
                orderedBottom.current = [...curBottoms, { id, bottom }];
            } else if (bottom <= curBottoms[0].bottom) {
                orderedBottom.current = [{ id, bottom }, ...curBottoms];
            } else {
                for (let i = curBottoms.length - 1; i > 0; i--) {
                    if (curBottoms[i - 1]) {
                        if (bottom >= curBottoms[i - 1].bottom && bottom < curBottoms[i].bottom) {
                            orderedBottom.current = [...curBottoms.slice(0, i), { id, bottom }, ...curBottoms.slice(i)];
                            break;
                        }
                    }
                }
            }
        }
    }

    const cropItems = useCallback(() => {
        let visibleItems: ScrollItem[];
        if (optimizeByVisibility) {
            visibleItems = calculatedItems.filter(item => item.bottom > scrollTop - bufferScreenAreaHeight && item.top < scrollBottom + bufferScreenAreaHeight);
        } else {
            visibleItems = calculatedItems.map(item => ({ ...item, visible: (item.bottom > scrollTop - bufferScreenAreaHeight && item.top < scrollBottom + bufferScreenAreaHeight) }));
        }
        setVisibleItems([...visibleItems]);
    }, [scrollTop, scrollBottom, calculatedItems, optimizeByVisibility])

    const addBufferingItems = useCallback(() => {
        if (!isBuffering) setLocalItems([...localItems, ...generateBufferItems(bufferSize)]);
    }, [localItems]);

    const createRequest = () => {
        setIsBuffering(true);
        const mockPromises = new Promise<ScrollItem[]>((resolve) => {
            setTimeout(() => {
                resolve(generateMockItems());
            }, 500);
        });
        setItemRequests(mockPromises);
    };

    const onScroll = useCallback(() => {
        if (ref.current) {
            const { top } = ref.current.getBoundingClientRect();
            setScrollTop(0 - top);
            setScrollBottom(window.innerHeight - top);
            if (bottomBoundary < window.innerHeight - top) {
                if (!isBuffering) {
                    addBufferingItems();
                    // TODO this is where the request happens
                    createRequest();
                    // TODO ////////////////////////////////////////
                }
            }
        }
    }, [calculatedItems, colCount, bottomBoundary, isBuffering]);

    useEffect(() => {
        // setLocalItems(generateMockItems());
        // alignItems({ colCount, debug: 'initiate' });
        addBufferingItems();
        createRequest();
    }, []);

    useEffect(() => {
        window.removeEventListener('scroll', onScroll);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [onScroll]);

    useEffect(() => {
        if (ref.current) {
            const { top } = ref.current.getBoundingClientRect();
            setScrollTop(0 - top);
            setScrollBottom(window.innerHeight - top);
            alignItems();
        }
    }, [localItems])

    useEffect(() => {
        cropItems();
    }, [calculatedItems, scrollTop, scrollBottom]);

    useEffect(() => {
        if (ref.current) {
            const { top } = ref.current.getBoundingClientRect();
            setScrollTop(0 - top);
            setScrollBottom(window.innerHeight - top);
        }
    }, [windowHeight])

    useEffect(() => {
        updateColumnCount(width, colCount);
        alignItems();
    }, [width, colCount]);

    useEffect(() => {
        itemRequests?.then((result) => {
            setLocalItems([...localItems.slice(0, 0 - bufferSize), ...result]);
            setIsBuffering(false);
        });
    }, [itemRequests]);

    return (
        <>
            <div style={{ position: 'fixed', left: 0, zIndex: 100, top: 0 }}>
                visible: {visibleItems.length}, scrollTop: {scrollTop}, scrollBot: {scrollBottom}, bottomBoundary: {bottomBoundary}, divWidth: {width}, colCount: {colCount}</div>
            <div ref={ref} className='scroll-loader-container' style={{ height: containerHeight }}>
                {
                    visibleItems?.map((t) => (
                        <ScrollItem
                            key={t.id}
                            height={t.height}
                            width={t.width}
                            translateX={t.translateX}
                            translateY={t.translateY}
                            image={t.image}
                            id={t.id}
                            shortDescription={t.shortDescription}
                            optimizeByVisibility={optimizeByVisibility}
                            visible={t.visible}
                            price={t.price}
                            location={t.location}
                            showFooter
                        />))
                }
            </div>
        </>

    )
}

export default ScrollLoader;