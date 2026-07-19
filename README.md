# HOUKAGO

HOUKAGO는 개발하며 배운 것들을 차분히 기록하는 개인 블로그입니다. 알고리즘 문제 풀이, CS 개념, 프로젝트 회고, 개발 과정에서 마주친 고민을 글로 정리합니다.

이 저장소는 HOUKAGO 블로그의 공개 프론트엔드 코드입니다. 글을 읽는 사람이 자연스럽게 탐색할 수 있도록 화면, 라우팅, 검색, 카테고리, 정적 빌드 구성을 관리합니다.

## 블로그에서 다루는 글

- 알고리즘 문제 풀이와 사고 과정
- 컴퓨터 과학 개념 정리
- 프로젝트 개발 기록과 회고
- 블로그 운영과 개발 환경 개선 기록

## 저장소 역할

`houkago.blog`는 블로그를 보여주는 애플리케이션을 담당합니다. 실제 게시글 원본은 별도 저장소인 `houkago.posts`에서 관리하고, 공통 운영 문서와 작성 규칙은 `houkago.docs`에서 관리합니다.

## 기술 스택

- Next.js
- TypeScript
- Tailwind CSS
- MDX 기반 콘텐츠 렌더링

## 콘텐츠 조회 전환 상태

`/blog`의 All Posts 첫 페이지와 `/blog/page/[page]`는 Next.js server-only client를 통해 backend
post list API를 사용하며 300초 revalidation을 적용합니다. `/blog`는 요청 시 SSR하여 frontend
build가 backend API 응답에 의존하지 않습니다. Backend URL은 server-side
`HOUKAGO_API_BASE_URL`로 주입합니다.

현재는 부분 전환 단계입니다. `/blog`의 featured, recent, category 정보와 글 상세, category, tag,
search, MDX, asset, sitemap, local draft preview는 기존 `houkago.posts` 기반 생성 파이프라인을
유지합니다. Backend 오류 시 All Posts를 local 데이터로 자동 fallback하지 않습니다.

## 관련 저장소

- `houkago.posts`: 게시글 원본과 콘텐츠 자산
- `houkago.docs`: 아키텍처, 작성 규칙, 운영 문서
