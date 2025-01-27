import rehypePrettyCode from "rehype-pretty-code";
import { defineCollection, defineConfig, s } from "velite";

const blogPosts = defineCollection({
	name: "Blog",
	pattern: "blog/**/*.mdx",
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
			permalink: `/${data.slug.replace("blog/", "")}`,
		})),
});

const psPosts = defineCollection({
	name: "PS",
	pattern: "ps/**/*.mdx",
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
			permalink: `/${data.slug.replace("ps/", "")}`,
		})),
});

export default defineConfig({
	root: "http://localhost:8080/api/posts",
	output: {
		data: ".velite",
		assets: "public/static",
		base: "/static/",
		name: "[name]-[hash:6].[ext]",
		clean: true,
	},
	collections: {
		blogPosts, psPosts
	},
	mdx: {
		rehypePlugins: [[rehypePrettyCode, { theme: "nord" }]],
	},
});	
