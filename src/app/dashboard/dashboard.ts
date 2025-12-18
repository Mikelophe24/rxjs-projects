import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  // Expose service observables
  stats$;
  isLoading$;
  isPaused$;
  error$;
  lastRefresh$;

  constructor(private dashboardService: DashboardService) {
    console.log('Dashboard Component initialized');

    // Initialize observables
    this.stats$ = this.dashboardService.stats$;
    this.isLoading$ = this.dashboardService.isLoading$;
    this.isPaused$ = this.dashboardService.isPaused$;
    this.error$ = this.dashboardService.error$;
    this.lastRefresh$ = this.dashboardService.lastRefresh$;
  }

  ngOnInit(): void {
    console.log('Dashboard polling started');
  }

  togglePause(): void {
    this.dashboardService.togglePause();
  }

  refresh(): void {
    this.dashboardService.refresh();
  }

  ngOnDestroy(): void {
    console.log('Dashboard Component destroyed');
    // Service là singleton nên không cần destroy
    // Nhưng nếu muốn stop polling khi leave page:
    // this.dashboardService.destroy();
  }
}
