import { type ReactNode } from "react";

interface VisuallyHiddenProps {
    children: ReactNode;
}

export function VisuallyHidden({ children }: VisuallyHiddenProps) {
    return (
        <span
            className="absolute h-px w-px p-0 -m-px overflow-hidden clip-rect whitespace-nowrap border-0"
            style={{
                clip: 'rect(0 0 0 0)',
            }}
        >
            {children}
        </span>
    );
}