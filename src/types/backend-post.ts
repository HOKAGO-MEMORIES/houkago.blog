export type BackendPostListItem = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly postDate: string;
  readonly updated: string | null;
  readonly tags: readonly string[];
  readonly thumbnail: string | null;
  readonly series: string | null;
  readonly featured: boolean;
};

export type BackendPostDetail = BackendPostListItem & {
  readonly platform: string | null;
  readonly problemId: string | null;
  readonly rawBody: string;
  readonly assetBaseUrl: string;
  readonly newerPost: BackendPostNavigationItem | null;
  readonly olderPost: BackendPostNavigationItem | null;
};

export type BackendPostNavigationItem = {
  readonly slug: string;
  readonly title: string;
  readonly postDate: string;
};

export type BackendSort = {
  readonly empty: boolean;
  readonly sorted: boolean;
  readonly unsorted: boolean;
};

export type BackendPageable = {
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly sort: BackendSort;
  readonly offset: number;
  readonly paged: boolean;
  readonly unpaged: boolean;
};

export type BackendPostPage = {
  readonly content: readonly BackendPostListItem[];
  readonly pageable: BackendPageable;
  readonly last: boolean;
  readonly totalPages: number;
  readonly totalElements: number;
  readonly size: number;
  readonly number: number;
  readonly sort: BackendSort;
  readonly first: boolean;
  readonly numberOfElements: number;
  readonly empty: boolean;
};
