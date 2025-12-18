import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  fromEvent,
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
} from 'rxjs';
import { ProductService, Product } from '../services/product.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  results: Product[] = [];
  loading = false;
  error: string | null = null;

  constructor(private productService: ProductService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    fromEvent(this.searchInput.nativeElement, 'input')
      .pipe(
        map((event: any) => event.target.value),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          if (!searchTerm.trim()) {
            this.results = [];
            this.cdr.detectChanges();
            return of([]);
          }

          this.loading = true;
          this.error = null;
          this.cdr.detectChanges();

          return this.productService.searchProducts(searchTerm).pipe(
            catchError((err) => {
              console.error('Search error:', err);
              this.error = 'Could not fetch results. Please try again.';
              this.loading = false;
              this.cdr.detectChanges();
              return of([]);
            })
          );
        })
      )
      .subscribe({
        next: (data) => {
          this.results = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Subscription error:', err);
          this.error = 'An unexpected error occurred.';
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }
}
