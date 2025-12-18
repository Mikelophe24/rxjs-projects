import { Injectable } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';

export interface ValidationError {
  field: string;
  message: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class FormValidationService {
  constructor() {}

  /**
   * Tạo email validation observable
   */
  createEmailValidation(control: FormControl, isTouched: () => boolean): Observable<string | null> {
    return control.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(() => {
        if (!isTouched()) return null;

        if (control.hasError('required')) {
          return 'Email is required';
        }
        if (control.hasError('email')) {
          return 'Please enter a valid email';
        }
        return null;
      })
    );
  }

  /**
   * Tạo password validation observable
   */
  createPasswordValidation(
    control: FormControl,
    isTouched: () => boolean
  ): Observable<string | null> {
    return control.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(() => {
        if (!isTouched()) return null;

        if (control.hasError('required')) {
          return 'Password is required';
        }
        if (control.hasError('minlength')) {
          const minLength = control.getError('minlength').requiredLength;
          return `Password must be at least ${minLength} characters`;
        }
        return null;
      })
    );
  }

  /**
   * Tạo confirm password validation observable
   * Sử dụng combineLatest để compare với password
   */
  createConfirmPasswordValidation(
    passwordControl: FormControl,
    confirmPasswordControl: FormControl,
    isTouched: () => boolean
  ): Observable<string | null> {
    return combineLatest([
      passwordControl.valueChanges.pipe(startWith('')),
      confirmPasswordControl.valueChanges.pipe(startWith('')),
    ]).pipe(
      debounceTime(300),
      map(([password, confirmPassword]) => {
        if (!isTouched()) return null;

        if (!confirmPassword) {
          return 'Confirm password is required';
        }
        if (password !== confirmPassword) {
          return 'Passwords do not match';
        }
        return null;
      })
    );
  }

  /**
   * Combine tất cả validations để check form validity
   */
  createFormValidityObservable(
    validationObservables: Observable<string | null>[]
  ): Observable<boolean> {
    return combineLatest(validationObservables).pipe(
      map((errors) => {
        // Form valid khi tất cả errors đều null
        return errors.every((error) => error === null);
      })
    );
  }

  /**
   * Tạo email FormControl với validators
   */
  createEmailControl(initialValue: string = ''): FormControl {
    return new FormControl(initialValue, [Validators.required, Validators.email]);
  }

  /**
   * Tạo password FormControl với validators
   */
  createPasswordControl(initialValue: string = '', minLength: number = 6): FormControl {
    return new FormControl(initialValue, [Validators.required, Validators.minLength(minLength)]);
  }

  /**
   * Tạo confirm password FormControl
   */
  createConfirmPasswordControl(initialValue: string = ''): FormControl {
    return new FormControl(initialValue, [Validators.required]);
  }

  /**
   * Custom validator: Check if passwords match
   * Có thể dùng như alternative cho combineLatest approach
   */
  static passwordMatchValidator(passwordControl: FormControl) {
    return (confirmPasswordControl: FormControl) => {
      if (!confirmPasswordControl.value) {
        return { required: true };
      }
      if (passwordControl.value !== confirmPasswordControl.value) {
        return { passwordMismatch: true };
      }
      return null;
    };
  }
}
