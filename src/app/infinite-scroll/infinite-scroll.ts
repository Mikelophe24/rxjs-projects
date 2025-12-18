import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfiniteScrollService } from '../services/infinite-scroll.service';

@Component({
  selector: 'app-infinite-scroll',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './infinite-scroll.html',
  styleUrl: './infinite-scroll.scss',
})
export class InfiniteScroll implements OnInit, OnDestroy {
  // Expose service observables
  posts$;
  isLoading$;
  hasMore$;
  error$;

  constructor(private scrollService: InfiniteScrollService) {
    console.log('Infinite Scroll Component initialized');

    // Initialize observables
    this.posts$ = this.scrollService.posts$;
    this.isLoading$ = this.scrollService.isLoading$;
    this.hasMore$ = this.scrollService.hasMore$;
    this.error$ = this.scrollService.error$;
  }

  ngOnInit(): void {
    // Load page đầu tiên
    this.scrollService.reset();
  }

  // Listen to scroll event
  @HostListener('window:scroll')
  onScroll(): void {
    // Check if user scrolled to bottom
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;

    // Trigger load more khi còn 200px nữa là đến cuối
    const threshold = 200;

    if (scrollPosition >= documentHeight - threshold) {
      this.loadMore();
    }
  }

  loadMore(): void {
    this.scrollService.loadMorePosts();
  }

  retry(): void {
    this.scrollService.reset();
  }

  // TrackBy function để optimize rendering
  trackByPostId(index: number, post: any): number {
    return post.id;
  }

  ngOnDestroy(): void {
    console.log('Infinite Scroll Component destroyed');
  }
}
