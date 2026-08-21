import { describe, expect, it, vi } from "vitest";

import { getSerializedMDX } from "@/lib/mdx";

const assetBaseUrl = "https://assets.example.test/assets/posts/runtime-post/";

describe("runtime post MDX serialization", () => {
  it("preserves supported Markdown semantics and rewrites post asset nodes", async () => {
    const source = `# Heading

## Runtime Detail

Paragraph with [an external link](https://example.test) and \`inline code\`.

Inline math $x^2 + y^2 = z^2$.

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
    expect(result.compiledSource).toContain('id: "runtime-detail"');
    expect(result.compiledSource).toContain('"data-language": "ts"');
    expect(result.compiledSource).toContain('children: " answer"');
    expect(result.compiledSource).toContain("https://example.test");
    expect(result.compiledSource).toContain("katex");
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

  it("reports bounded stage timings without exposing source content", async () => {
    const source = "Inline math $x^2$ and `code`.\n\n```java\nint answer = 42;\n```";
    const onTiming = vi.fn();

    await getSerializedMDX(source, { assetBaseUrl, onTiming });

    expect(onTiming).toHaveBeenCalledOnce();
    expect(onTiming).toHaveBeenCalledWith({
      shikiReadyBeforeSerialize: expect.any(Boolean),
      shikiInitializationMs: expect.toSatisfy(
        (value: unknown) => value === null || typeof value === "number",
      ),
      assetRewriteMs: expect.any(Number),
      rehypeKatexMs: expect.any(Number),
      rehypePrettyCodeMs: expect.any(Number),
      parseAndCompileMs: expect.any(Number),
      totalMs: expect.any(Number),
    });
    expect(JSON.stringify(onTiming.mock.calls[0][0])).not.toContain(source);
  });
});
