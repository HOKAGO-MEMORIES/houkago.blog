import { cn } from "@/components/ui/utils";
import * as runtime from 'react/jsx-runtime';

interface MDXProps {
    code: string;
}

const components = {
	a: ({ className, ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
		<a
			target="_blank"
			rel="noopener"
			{...props}
			className={cn([className, "text-primary"])}
		/>
	),
};

const useMDXComponent = (code: string) => {
    const fn = new Function(code);
    return fn({ ...runtime }).default;
}



export const MDXContent = ({ code }: MDXProps) => {
    const Component = useMDXComponent(code);

    return (
        <div className="prose prose-slate dark:prose-invert flex-1">
            <Component components={ components } />
        </div>
    );
}