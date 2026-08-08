import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { StoreApi, UseBoundStore } from 'zustand';

/**
 * Subscribes to a store slice and runs `apply` imperatively — outside React's
 * render cycle. Calls invalidate() so a demand-driven frameloop redraws once.
 *
 * Safe across StrictMode double-invocations.
 */
export function useTransientSelector<S, U>(
    useStore: UseBoundStore<StoreApi<S>>,
    selector: (state: S) => U,
    apply: (value: U) => void,
): void {
    const invalidate = useThree((s) => s.invalidate);
    const applyRef = useRef(apply);
    applyRef.current = apply;

    useEffect(() => {
        // Run once immediately so we are correct at mount
        applyRef.current(selector(useStore.getState()));
        invalidate();

        let previous = selector(useStore.getState());
        return useStore.subscribe((state) => {
            const next = selector(state);
            if (Object.is(next, previous)) return;
            previous = next;
            applyRef.current(next);
            invalidate(); // request exactly one frame
        });
    }, [useStore, invalidate]);
}
