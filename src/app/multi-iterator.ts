// Slightly modified https://github.com/johnameyer/harmony-ts/blob/master/src/util/make-lazy-iterator.ts

export interface LazyMultiIterable<T> extends IterableIterator<T> {
    reset(): void;
}

/**
 * Makes an iterator that can be iterated over multiple times, but only accesses items once they are requested
 * @param generator the iterator to wrap and cache values from
 * @returns the wrapping iterator
 */
export function makeLazyMultiIterable<S>(generator: Iterator<S>) {
    const arr: (S | undefined)[] = [];
    let i = 0;

    const proxyHandler = {

        get: (_: S[], prop: symbol | string) => {
            if(prop == Symbol.iterator) {
                return function * () {
                    let i = 0;
                    for(; i < arr.length; i++) {
                        yield arr[i];
                    }
                    let { done, value } = generator.next();
                    while(!done) {
                        arr[i] = value;
                        yield arr[i];
                        i++;
                        ({ done, value } = generator.next());
                    }
                };
            }
            if(prop == 'length') {
                return arr.length;
            }
            if(prop == 'reset') {
                i = 0;
            }
            if(prop == 'next') {
                // @ts-ignore
                return () => {
                    i++;
                    if(arr[i] === undefined) {
                        // @ts-expect-error
                        for(let j = i; j < prop; j++) {
                            const next = generator.next();
                            if(next.done) {
                                break;
                            }
                            arr[j] = next.value;
                            return { value: arr[j] };
                        }
                    }
                };
            }
            // @ts-expect-error
            if(arr[prop] === undefined) {
                // @ts-expect-error
                for(let j = i; j < prop; j++) {
                    const next = generator.next();
                    if(next.done) {
                        break;
                    }
                    arr[j] = next.value;
                }
            }
            // @ts-expect-error
            return Reflect.get(...arguments);
        },
    };

    // @ts-expect-error
    return new Proxy(arr, proxyHandler) as LazyMultiIterable<S>;
}