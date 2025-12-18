import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://127.0.0.1:3000/products';

  constructor(private http: HttpClient) {}

  searchProducts(term: string): Observable<Product[]> {
    return this.http
      .get<Product[]>(this.apiUrl)
      .pipe(
        map((products) =>
          products.filter(
            (p) =>
              p.name.toLowerCase().includes(term.toLowerCase()) ||
              p.category.toLowerCase().includes(term.toLowerCase())
          )
        )
      );
  }
}
