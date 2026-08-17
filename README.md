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

`/blog`의 All Posts 첫 페이지와 Recent Posts는 한 번 조회한 backend page 0을 함께 사용합니다.
Featured Posts는 별도 `featured=true`, page 0, size 3 요청을 사용하고, 응답이 비어 있으면 기존처럼
section을 숨깁니다. `/blog/page/[page]`도 Next.js server-only client를 통해 backend post list API를
사용합니다. Backend list 조회에는 300초 revalidation을 적용합니다. `/blog`는 요청 시 SSR하여
frontend build가 backend API 응답에 의존하지 않습니다. Backend URL은 server-side
`HOUKAGO_API_BASE_URL`로 주입합니다.

Public `/blog/[slug]` post detail과 metadata도 server-only Backend detail loader를 사용합니다. Backend
`rawBody`는 기존 MDX renderer로 처리하고 `./assets/...`는 API의 `assetBaseUrl`로 resolve합니다. Detail
`404`만 route not-found로 변환하며, 다른 Backend 오류에는 local generated body로 fallback하지 않습니다.
Post slug는 frontend build에서 더 이상 열거하지 않고 요청 시 처리합니다.

Category route와 pagination은 Backend `category` filter와 pagination metadata를 사용하며 Backend 순서를
그대로 표시합니다. `/blog`의 category count와 Category Highlights도 네 category의 page 0 요청을 병렬로
실행해 `totalElements`와 최신 3개를 사용합니다. Category와 post가 공유하는 dynamic segment는 더 이상
content 기반 static params를 만들지 않으므로 Backend가 unreachable한 frontend build도 성공합니다.

Tag route와 pagination도 Backend의 exact `tag` filter, `totalElements`, pagination metadata와 canonical
order를 사용합니다. Unknown Tag와 범위를 벗어난 page는 기존처럼 `404`이며, Tag segment를 build에서
열거하지 않습니다. Tag fetch는 다른 post API 요청과 같은 `houkago-posts` cache tag와 300초 fallback을
사용합니다.

현재는 부분 전환 단계입니다. Search, sitemap, local draft preview 등은 기존 `houkago.posts` 기반 생성
파이프라인을 유지합니다. Recent Posts는 별도 backend 요청 없이 All Posts와 같은 page 0 결과를
재사용합니다. Featured 응답에 non-featured 글이 섞이면 오류로 처리하며, Backend 오류 시 Backend 기반
목록, detail, category, Tag를 local 데이터로 자동 fallback하지 않습니다.

## 관련 저장소

- `houkago.posts`: 게시글 원본과 콘텐츠 자산
- `houkago.docs`: 아키텍처, 작성 규칙, 운영 문서
