    // const search = (keyword: string) => {
    //     // api calls
    // }

    // const debounce = (func: (...args: any[]) => any, delay = 2000) => {
    //     let timer: ReturnType<typeof setTimeout> | undefined;
    //     const debounced =  (...args: any[]) => {
    //         const context = this;
    //         clearTimeout(timer);
    //         timer = setTimeout(() => {
    //             func.apply(context, args);
    //         }, delay);
    //     }

    //     debounced.cancel = () => {
    //         clearTimeout(timer);
    //         timer = undefined;
    //     }
    //     return debounced;
    // }

    // const debounceSearch = debounce(search);

    // const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     debounceSearch(event.target.value);
    // }

    // const throttle = (func: (...args: any[]) => any, delay = 1000) => {
    //     let shouldWait = false;
    //     return (...args: any[]) => {
    //         const context = this;
    //         if (shouldWait) return;

    //         func.apply(context, args);
    //         shouldWait = true;

    //         setTimeout(() => {
    //             shouldWait = false;
    //         }, delay);
    //     }
    // }

    // const debounce = (func: (...args: any[]) => any, delay = 1000) => {
    //     let timer: ReturnType<typeof setTimeout> | undefined;

    //     const debounced = function (this: unknown, ...args: any[]) {
    //         clearTimeout(timer)
    //         timer = setTimeout(() => {
    //             func.apply(this, args)
    //         }, delay);
    //     }

    //     debounced.cancel = () => {
    //         clearTimeout(timer);
    //         timer = undefined;
    //     }
    //     return debounced;
    // }

    // const trottle = (func: (...args: any[]) => any, delay = 100) => {
    //     let shouldWait = false;

    //     return function(this: unknown, ...args: any[]) {
    //         if (shouldWait) return;

    //         func.apply(this, args);
    //         shouldWait = true;

    //         setTimeout(() => {
    //             shouldWait = false;
    //         }, delay);
    //     }
    // }

    // const throttledSearch = throttle(search);

    // class EventEmitter<T extends (...args: any[]) => any> {
    //     public events: Record<string, T[]>;

    //     constructor() {
    //         this.events = {}
    //     }

    //     on(event: string, handler: T) {
    //         if (!this.events[event]) this.events[event] = [];
    //         this.events[event].push(handler)
    //     }

    //     off(event: string, handler: T) {
    //         this.events[event] = this.events[event].filter((h) => h !== handler);
    //     }

    //     emit(event: string, ...args: any[]) {
    //         (this.events[event] || []).forEach(handler => handler(args));
    //     }
    // }



// const search = (text: string) => {
//     console.log(text);
//     //making api call   
// }

// const debounce = (cb: any, delay=500) => {
//     let timeout: NodeJS.Timeout;

//     return function (this: unknown, ...args: Parameters) {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => {
//             cb.apply(this, args);
//         }, delay)
//     }
// }

// const debouncedSearch = debounce(search);