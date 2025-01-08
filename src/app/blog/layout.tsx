import PageLayout from "@/components/page-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <PageLayout title="Blog" description="블로그 글을 작성해봅시다!">
            {children}
        </PageLayout>
    );
}