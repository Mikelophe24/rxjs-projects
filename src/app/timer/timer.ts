import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject } from 'rxjs';
import { takeUntil, scan, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timer.html',
  styleUrl: './timer.scss',
})
export class Timer implements OnDestroy {
  // Subject để control lifecycle của Observable (hot observable)
  private destroy$ = new Subject<void>();
  private pause$ = new Subject<void>();

  // State của timer
  currentSeconds = 0;
  isRunning = false;

  constructor(private cdr: ChangeDetectorRef) {
    console.log('Timer Component initialized');
  }

  // Start hoặc Resume timer
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.pause$ = new Subject<void>(); // Reset pause subject

    // interval là cold observable - chỉ bắt đầu khi có subscriber
    interval(1000)
      .pipe(
        // startWith để emit ngay lập tức, không delay 1s
        startWith(0),
        // takeUntil biến nó thành hot observable - dừng khi pause$ emit
        takeUntil(this.pause$),
        // map để transform giá trị
        map((tick) => tick + 1),
        // scan để accumulate giá trị (giống reduce nhưng emit mỗi lần)
        scan((acc, curr) => acc + 1, this.currentSeconds)
      )
      .subscribe({
        next: (seconds) => {
          this.currentSeconds = seconds;
          // Force Angular detect changes để update UI
          this.cdr.detectChanges();
          console.log('Timer tick:', seconds);
        },
        complete: () => {
          console.log('Timer paused');
          this.isRunning = false;
          this.cdr.detectChanges();
        },
      });
  }

  // Pause timer
  pause(): void {
    if (!this.isRunning) return;

    this.pause$.next();
    this.pause$.complete();
    this.isRunning = false;
  }

  // Reset timer về 0
  reset(): void {
    this.pause();
    this.currentSeconds = 0;
  }

  // Format seconds thành MM:SS
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Cleanup khi component bị destroy
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.pause$.next();
    this.pause$.complete();
    console.log('Timer Component destroyed - all observables cleaned up');
  }
}
