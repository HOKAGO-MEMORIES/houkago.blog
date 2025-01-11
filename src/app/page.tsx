import PageLayout from "@/components/page-layout";
import Banner from "./components/banner";
import RecentPosts from "./components/recent-posts";

export default function Home() {
  return (
    <PageLayout>
      <Banner />
      <RecentPosts />
    </PageLayout>
  );
}
