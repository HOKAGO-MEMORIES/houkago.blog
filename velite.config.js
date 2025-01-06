import rehypePrettyCode from "rehype-pretty-code";
import { defineConfig, s } from "velite";

export default defineConfig({
	root: "src",
	collections: {
		blogPosts: {
			name: "Blog",
			pattern: "posts/*.mdx",
			schema: s
				.object({
					title: s.string().max(99),
					desc: s.string().max(99),
					slug: s.path(),
					date: s.string(),
					thumbnail: s.string().max(99),
					body: s.mdx(),
				})
				.transform((data) => ({
					...data,
					permalink: `/${data.slug}`,
					slug: data.slug.replaceAll("blog/", ""),
				})),
		},
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