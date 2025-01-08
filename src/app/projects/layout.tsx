import PageLayout from "@/components/page-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <PageLayout title="Projects" description="그동안 해온 프로젝트입니다.">
            {children}
        </PageLayout>
    );
}