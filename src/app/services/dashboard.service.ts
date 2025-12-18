import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { switchMap, retry, shareReplay, catchError, tap, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalSales: number;
  todayRevenue: number;
  lastUpdated: Date;
}

export interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  isPaused: boolean;
  error: string | null;
  lastRefresh: Date | null;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly POLLING_INTERVAL = 5000; // 5 seconds
  private readonly API_URL = 'https://jsonplaceholder.typicode.com/users';

  // Subjects
  private pause$ = new BehaviorSubject<boolean>(false);
  private destroy$ = new Subject<void>();
  private manualRefresh$ = new Subject<void>();

  // State
  private state$ = new BehaviorSubject<DashboardState>({
    stats: null,
    isLoading: false,
    isPaused: false,
    error: null,
    lastRefresh: null,
  });

  // Public observables
  public stats$: Observable<DashboardStats | null>;
  public isLoading$: Observable<boolean>;
  public isPaused$: Observable<boolean>;
  public error$: Observable<string | null>;
  public lastRefresh$: Observable<Date | null>;

  // Polling observable với shareReplay
  private pollingData$!: Observable<DashboardStats>;

  constructor(private http: HttpClient) {
    // Initialize derived observables
    this.stats$ = this.state$.pipe(switchMap((state) => of(state.stats)));
    this.isLoading$ = this.state$.pipe(switchMap((state) => of(state.isLoading)));
    this.isPaused$ = this.state$.pipe(switchMap((state) => of(state.isPaused)));
    this.error$ = this.state$.pipe(switchMap((state) => of(state.error)));
    this.lastRefresh$ = this.state$.pipe(switchMap((state) => of(state.lastRefresh)));

    // Setup polling
    this.setupPolling();
  }

  private setupPolling(): void {
    // timer(0, interval) - emit ngay lập tức, sau đó mỗi interval
    // 0 = emit ngay, 5000 = emit mỗi 5s
    this.pollingData$ = timer(0, this.POLLING_INTERVAL).pipe(
      // Chỉ poll khi không pause
      switchMap(() => {
        if (this.pause$.value) {
          console.log('Polling paused, skipping...');
          return of(this.state$.value.stats!);
        }
        return this.fetchDashboardData();
      }),
      // shareReplay - QUAN TRỌNG!
      // Cache kết quả cuối cùng và share cho tất cả subscribers
      // Tránh multiple API calls khi có nhiều subscribers
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntil(this.destroy$)
    );

    // Subscribe để update state
    this.pollingData$.subscribe({
      next: (stats) => {
        this.updateState({
          stats,
          isLoading: false,
          error: null,
          lastRefresh: new Date(),
        });
      },
      error: (error) => {
        console.error('Polling error:', error);
        this.updateState({
          isLoading: false,
          error: error.message || 'Failed to fetch data',
        });
      },
    });

    // Manual refresh
    this.manualRefresh$
      .pipe(
        tap(() => this.updateState({ isLoading: true, error: null })),
        switchMap(() => this.fetchDashboardData()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (stats) => {
          this.updateState({
            stats,
            isLoading: false,
            error: null,
            lastRefresh: new Date(),
          });
        },
        error: (error) => {
          this.updateState({
            isLoading: false,
            error: error.message || 'Failed to refresh data',
          });
        },
      });
  }

  private fetchDashboardData(): Observable<DashboardStats> {
    console.log('Fetching dashboard data...');

    return this.http.get<any[]>(this.API_URL).pipe(
      // Transform API response thành DashboardStats
      switchMap((users) => {
        const stats: DashboardStats = {
          totalUsers: users.length,
          activeUsers: Math.floor(users.length * 0.7), // 70% active
          totalSales: Math.floor(Math.random() * 10000) + 5000,
          todayRevenue: Math.floor(Math.random() * 5000) + 1000,
          lastUpdated: new Date(),
        };
        return of(stats);
      }),
      // retry - Tự động retry 3 lần nếu có lỗi
      retry({
        count: 3,
        delay: 1000, // Đợi 1s giữa các lần retry
      }),
      // catchError - Handle lỗi sau khi retry hết
      catchError((error) => {
        console.error('Error after retries:', error);
        throw error;
      }),
      tap(() => console.log('Data fetched successfully'))
    );
  }

  private updateState(partial: Partial<DashboardState>): void {
    const currentState = this.state$.value;
    this.state$.next({
      ...currentState,
      ...partial,
    });
  }

  // Public methods
  pause(): void {
    this.pause$.next(true);
    this.updateState({ isPaused: true });
    console.log('Polling paused');
  }

  resume(): void {
    this.pause$.next(false);
    this.updateState({ isPaused: false });
    console.log('Polling resumed');
  }

  togglePause(): void {
    const isPaused = this.pause$.value;
    if (isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  refresh(): void {
    console.log('Manual refresh triggered');
    this.manualRefresh$.next();
  }

  getCurrentState(): DashboardState {
    return this.state$.value;
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.pause$.complete();
    this.manualRefresh$.complete();
    this.state$.complete();
  }
}
