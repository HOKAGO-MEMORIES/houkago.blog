import { cn } from "./ui/utils"

interface PageLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string;
}

export default function PageLayout({
    children,
    title,
    description,
    className,
}: PageLayoutProps) {
    return (
        <div className={cn(["flex flex-col gap-5 px-5 pt-7 pb-16", className])}>
            {(title || description) && (
                <div className="flex flex-col gap-3">
                    {title && (
                        <h1 className="break-words text-5xl font-bold tracking-tight text-primary sm:text-6xl">
                            {title.toUpperCase()}
                        </h1>
                    )}
                    {description && (
                        <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {children}
        </div>
    );
}
