import { describe, expect, it } from "vitest";

import {
  estimatePostReadingMinutes,
  extractPostTableOfContents,
} from "@/lib/post-headings";

describe("post heading contracts", () => {
  it("extracts H2 and H3 headings with deterministic duplicate ids", () => {
    const markdown = `## 문제 이해

### [PriorityQueue](https://example.test)

## 문제 이해

\`\`\`md
## 코드 블록 안 제목
\`\`\`
`;

    expect(extractPostTableOfContents(markdown)).toEqual([
      { id: "문제-이해", level: 2, text: "문제 이해" },
      { id: "priorityqueue", level: 3, text: "PriorityQueue" },
      { id: "문제-이해-2", level: 2, text: "문제 이해" },
    ]);
  });

  it("never reports less than one reading minute", () => {
    expect(estimatePostReadingMinutes("짧은 글")).toBe(1);
  });
});
