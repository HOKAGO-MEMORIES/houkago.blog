# houkago.blog

![Next.js](https://img.shields.io/badge/Next.js-15.1.7-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0.8-06B6D4?logo=tailwindcss)
![Shadcn/ui](https://img.shields.io/badge/Shadcn/ui-Design-000000?logo=shadcnui)
![Vercel](https://img.shields.io/badge/Vercel-Hosting-000000?logo=vercel)


방과후 블로그에 오신 것을 환영합니다.  
현재 포스트는 이 저장소 내부의 `.posts`에서 직접 작성/관리합니다.  

## 로컬 포스트 작성 방법

- 블로그 글: `.posts/blogPosts.json`
- PS 글: `.posts/psPosts.json`
- 공통 필드: `title`, `date`, `desc`, `category`, `slug`, `body`, `permalink`

예시:
```json
{
  "title": "새 글 제목",
  "date": "2026-02-28",
  "desc": "요약",
  "category": "BLOG",
  "slug": "my-new-post",
  "thumbnail": "/images/sample.png",
  "body": "# 본문\\n\\n여기에 내용을 작성합니다.",
  "permalink": "/my-new-post"
}
```

<details>
<summary>CHANGE LOG</summary>

- 댓글 기능 추가 예정 (giscus)
- 구글 애널리틱스 연결 예정
- mdx에 css 스타일 적용 예정
- 백엔드 의존 제거, 프론트엔드 저장소에서 포스트 직접 관리
- 카테고리를 blog와 ps로 분리

</details>
