import type {
  BackendPostDetail,
  BackendPostListItem,
  BackendPostPage,
  BackendSort,
} from "@/types/backend-post";

export const backendSortFixture: BackendSort = {
  empty: false,
  sorted: true,
  unsorted: false,
};

export const backendPostListItemFixture: BackendPostListItem = {
  slug: "synthetic-post",
  title: "Synthetic Post",
  description: "A small synthetic post used by unit tests.",
  category: "blog",
  postDate: "2026-07-14",
  updated: "2026-07-15",
  tags: ["backend", "testing"],
  thumbnail: "/images/synthetic.png",
  series: "API migration",
  featured: true,
};

export const nullableBackendPostListItemFixture: BackendPostListItem = {
  ...backendPostListItemFixture,
  slug: "nullable-post",
  title: "Nullable Post",
  updated: null,
  tags: ["nullable"],
  thumbnail: null,
  series: null,
  featured: false,
};

export const backendPostDetailFixture: BackendPostDetail = {
  ...backendPostListItemFixture,
  rawBody: "# Synthetic body\n\nBody content is preserved.\n",
};

export const backendPostPageFixture: BackendPostPage = {
  content: [backendPostListItemFixture, nullableBackendPostListItemFixture],
  pageable: {
    pageNumber: 0,
    pageSize: 2,
    sort: backendSortFixture,
    offset: 0,
    paged: true,
    unpaged: false,
  },
  last: false,
  totalPages: 2,
  totalElements: 3,
  size: 2,
  number: 0,
  sort: backendSortFixture,
  first: true,
  numberOfElements: 2,
  empty: false,
};

export const emptyBackendPostPageFixture: BackendPostPage = {
  content: [],
  pageable: {
    pageNumber: 2,
    pageSize: 2,
    sort: backendSortFixture,
    offset: 4,
    paged: true,
    unpaged: false,
  },
  last: true,
  totalPages: 2,
  totalElements: 3,
  size: 2,
  number: 2,
  sort: backendSortFixture,
  first: false,
  numberOfElements: 0,
  empty: true,
};
