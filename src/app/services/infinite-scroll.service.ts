import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { exhaustMap, scan, tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export interface PaginationState {
  posts: Post[];
  currentPage: number;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class InfiniteScrollService {
  private readonly API_URL = 'https://jsonplaceholder.typicode.com/posts';
  private readonly PAGE_SIZE = 10;

  // Subject để trigger load more
  private loadMore$ = new Subject<void>();

  // State management với BehaviorSubject
  private state$ = new BehaviorSubject<PaginationState>({
    posts: [],
    currentPage: 0,
    isLoading: false,
    hasMore: true,
    error: null,
  });

  // Public observable cho components
  public posts$: Observable<Post[]> = this.state$.pipe(map((state) => state.posts));

  public isLoading$: Observable<boolean> = this.state$.pipe(map((state) => state.isLoading));

  public hasMore$: Observable<boolean> = this.state$.pipe(map((state) => state.hasMore));

  public error$: Observable<string | null> = this.state$.pipe(map((state) => state.error));

  constructor(private http: HttpClient) {
    this.setupInfiniteScroll();
  }

  private setupInfiniteScroll(): void {
    this.loadMore$
      .pipe(
        // tap để set loading state trước khi gọi API
        tap(() => {
          const currentState = this.state$.value;
          this.state$.next({
            ...currentState,
            isLoading: true,
            error: null,
          });
        }),
        // exhaustMap - QUAN TRỌNG!
        // Ignore requests mới nếu request hiện tại chưa hoàn thành
        // Tránh duplicate requests khi user scroll nhanh
        exhaustMap(() => {
          const nextPage = this.state$.value.currentPage + 1;
          return this.fetchPosts(nextPage).pipe(
            // catchError để handle lỗi
            catchError((error) => {
              console.error('Error loading posts:', error);
              return of({ posts: [], error: error.message });
            })
          );
        }),
        // scan để accumulate posts (giống reducer)
        scan((state: PaginationState, response: { posts: Post[]; error?: string }) => {
          if (response.error) {
            return {
              ...state,
              isLoading: false,
              error: response.error,
            };
          }

          const newPosts = response.posts;
          const allPosts = [...state.posts, ...newPosts];

          return {
            posts: allPosts,
            currentPage: state.currentPage + 1,
            isLoading: false,
            hasMore: newPosts.length === this.PAGE_SIZE,
            error: null,
          };
        }, this.state$.value)
      )
      .subscribe((newState) => {
        this.state$.next(newState);
        console.log('State updated:', newState);
      });
  }

  private fetchPosts(page: number): Observable<{ posts: Post[] }> {
    const start = (page - 1) * this.PAGE_SIZE;
    const url = `${this.API_URL}?_start=${start}&_limit=${this.PAGE_SIZE}`;

    console.log(`Fetching page ${page}...`);

    return this.http.get<Post[]>(url).pipe(
      map((posts) => ({ posts })),
      tap(() => console.log(`Page ${page} loaded successfully`))
    );
  }

  // Public method để trigger load more
  loadMorePosts(): void {
    const currentState = this.state$.value;

    // Không load nếu đang loading hoặc không còn data
    if (currentState.isLoading || !currentState.hasMore) {
      console.log('Skip loading:', {
        isLoading: currentState.isLoading,
        hasMore: currentState.hasMore,
      });
      return;
    }

    this.loadMore$.next();
  }

  // Reset về initial state
  reset(): void {
    this.state$.next({
      posts: [],
      currentPage: 0,
      isLoading: false,
      hasMore: true,
      error: null,
    });
    // Load page đầu tiên
    this.loadMorePosts();
  }

  // Get current state (for debugging)
  getCurrentState(): PaginationState {
    return this.state$.value;
  }
}
