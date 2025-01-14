import rehypePrettyCode from "rehype-pretty-code";
import { defineConfig, s } from "velite";

export default defineConfig({
	root: "src/posts",
	collections: {
		blogPosts: {
			name: "Blog",
			pattern: "blog/*.mdx",
			schema: s
				.object({
					title: s.string().max(99),
					desc: s.string().max(99),
					slug: s.path(),
					date: s.string(),
					thumbnail: s.string().max(99),
					body: s.mdx(),
					from: s.string().max(99),
				})
				.transform((data) => ({
					...data,
					permalink: `/${data.slug}`,
					slug: data.slug.replaceAll("blog/", ""),
				})),
		},
		psPosts: {
			name: "PS",
			pattern: "ps/*.mdx",
			schema: s
				.object({
					title: s.string().max(99),
					desc: s.string().max(99),
					slug: s.path(),
					date: s.string(),
					body: s.mdx(),
					from: s.string().max(99),
				})
				.transform((data) => ({
					...data,
					permalink: `/${data.slug}`,
					slug: data.slug.replaceAll("ps/", ""),
				})),
		}
	},
	output: {
		data: ".velite",
		assets: "public/static",
		base: "/static/",
		name: "[name]-[hash:6].[ext]",
		clean: true,
	},
	mdx: {
		rehypePlugins: [[rehypePrettyCode, { theme: "nord" }]],
	},
});