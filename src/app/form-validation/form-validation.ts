import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormValidationService } from '../services/form-validation.service';

@Component({
  selector: 'app-form-validation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-validation.html',
  styleUrl: './form-validation.scss',
})
export class FormValidation implements OnDestroy {
  private destroy$ = new Subject<void>();

  // Form controls - tạo từ service
  emailControl;
  passwordControl;
  confirmPasswordControl;

  // Form group
  loginForm;

  // Track touched state
  emailTouched = false;
  passwordTouched = false;
  confirmPasswordTouched = false;

  // Validation observables - tạo từ service
  emailError$;
  passwordError$;
  confirmPasswordError$;

  // Form validity - combine tất cả validations
  isFormValid$;

  constructor(private validationService: FormValidationService) {
    console.log('Form Validation Component initialized with FormValidationService');

    // Initialize form controls
    this.emailControl = this.validationService.createEmailControl();
    this.passwordControl = this.validationService.createPasswordControl('', 6);
    this.confirmPasswordControl = this.validationService.createConfirmPasswordControl();

    // Initialize form group
    this.loginForm = new FormGroup({
      email: this.emailControl,
      password: this.passwordControl,
      confirmPassword: this.confirmPasswordControl,
    });

    // Initialize validation observables
    this.emailError$ = this.validationService
      .createEmailValidation(this.emailControl, () => this.emailTouched)
      .pipe(takeUntil(this.destroy$));

    this.passwordError$ = this.validationService
      .createPasswordValidation(this.passwordControl, () => this.passwordTouched)
      .pipe(takeUntil(this.destroy$));

    this.confirmPasswordError$ = this.validationService
      .createConfirmPasswordValidation(
        this.passwordControl,
        this.confirmPasswordControl,
        () => this.confirmPasswordTouched
      )
      .pipe(takeUntil(this.destroy$));

    // Initialize form validity observable
    this.isFormValid$ = this.validationService
      .createFormValidityObservable([
        this.emailError$,
        this.passwordError$,
        this.confirmPasswordError$,
      ])
      .pipe(takeUntil(this.destroy$));
  }

  onEmailBlur(): void {
    this.emailTouched = true;
  }

  onPasswordBlur(): void {
    this.passwordTouched = true;
  }

  onConfirmPasswordBlur(): void {
    this.confirmPasswordTouched = true;
  }

  onSubmit(): void {
    // Mark all as touched để hiển thị errors
    this.emailTouched = true;
    this.passwordTouched = true;
    this.confirmPasswordTouched = true;

    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      console.log('Form submitted successfully!', formValue);
      alert(`✅ Form submitted!\nEmail: ${formValue.email}\nPassword: ${formValue.password}`);

      // Reset form
      this.loginForm.reset();
      this.emailTouched = false;
      this.passwordTouched = false;
      this.confirmPasswordTouched = false;
    } else {
      console.log('Form is invalid');
      alert('❌ Please fix the errors before submitting');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    console.log('Form Validation Component destroyed');
  }
}
