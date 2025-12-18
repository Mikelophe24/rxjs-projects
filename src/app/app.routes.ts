import { Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { Timer } from './timer/timer';
import { Cart } from './cart/cart';
import { FormValidation } from './form-validation/form-validation';
import { InfiniteScroll } from './infinite-scroll/infinite-scroll';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  { path: 'search', component: SearchComponent },
  { path: 'timer', component: Timer },
  { path: 'cart', component: Cart },
  { path: 'form', component: FormValidation },
  { path: 'scroll', component: InfiniteScroll },
  { path: 'dashboard', component: Dashboard },
];
