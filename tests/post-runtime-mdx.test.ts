import { describe, expect, it } from "vitest";

import { getSerializedMDX } from "@/lib/mdx";

const assetBaseUrl = "https://assets.example.test/assets/posts/runtime-post/";

describe("runtime post MDX serialization", () => {
  it("preserves supported Markdown semantics and rewrites post asset nodes", async () => {
    const source = `# Heading

Paragraph with [an external link](https://example.test) and \`inline code\`.

![cover](./assets/cover.png)

![nested](./assets/diagrams/flow-chart.png)

[download](./assets/files/sample.pdf)

| Name | Value |
| --- | ---: |
| answer | 42 |

\`\`\`ts
const answer = 42;
\`\`\`
`;

    const result = await getSerializedMDX(source, { assetBaseUrl });

    expect(result.compiledSource).toContain("Heading");
    expect(result.compiledSource).toContain('"data-language": "ts"');
    expect(result.compiledSource).toContain('children: " answer"');
    expect(result.compiledSource).toContain("https://example.test");
    expect(result.compiledSource).toContain(
      "https://assets.example.test/assets/posts/runtime-post/cover.png",
    );
    expect(result.compiledSource).toContain(
      "https://assets.example.test/assets/posts/runtime-post/diagrams/flow-chart.png",
    );
    expect(result.compiledSource).toContain(
      "https://assets.example.test/assets/posts/runtime-post/files/sample.pdf",
    );
    expect(result.compiledSource).not.toContain("./assets/");
  });

  it("keeps the existing local serialization behavior when no asset base is supplied", async () => {
    const result = await getSerializedMDX("![local](./assets/local.png)");

    expect(result.compiledSource).toContain("./assets/local.png");
  });

  it("rejects traversal before emitting an asset URL", async () => {
    await expect(
      getSerializedMDX("![unsafe](./assets/../private.png)", { assetBaseUrl }),
    ).rejects.toThrow("must not traverse or escape");
  });
});
