import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, AuthRequest } from '../../services/auth.service';
import { EventTrackingService } from '../../services/event-tracking.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  signupForm: FormGroup;
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';
  private returnUrl = '/catalogue';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private eventTrackingService: EventTrackingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.createLoginForm();
    this.signupForm = this.createSignupForm();
  }

  ngOnInit(): void {
    // Get return URL from route params or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/catalogue';
    
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      console.log('[LOGIN] User already authenticated, redirecting to:', this.returnUrl);
      this.router.navigate([this.returnUrl]);
    }
  }

  /**
   * Create login form with validation
   */
  private createLoginForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  /**
   * Create signup form with validation
   */
  private createSignupForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value 
      ? { passwordMismatch: true } 
      : null;
  }

  /**
   * Switch between login and signup modes
   */
  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.resetForms();
    console.log(`[LOGIN] Switched to ${this.isLoginMode ? 'login' : 'signup'} mode`);
  }

  /**
   * Reset both forms - made public for template access
   */
  resetForms(): void {
    this.loginForm.reset();
    this.signupForm.reset();
  }

  /**
   * Handle login form submission
   */
  onLogin(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const credentials: AuthRequest = this.loginForm.value;
      console.log(`[LOGIN] Submitting login form for: ${credentials.username}`);
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log(`[LOGIN] Login successful, redirecting to: ${this.returnUrl}`);
          // Refresh event tracking user ID to use authenticated user
          this.eventTrackingService.refreshUserId();
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error(`[LOGIN] Login failed:`, error);
          this.handleAuthError(error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  /**
   * Handle signup form submission
   */
  onSignup(): void {
    if (this.signupForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const credentials: AuthRequest = {
        username: this.signupForm.value.username,
        password: this.signupForm.value.password
      };
      
      console.log(`[LOGIN] Submitting signup form for: ${credentials.username}`);
      
      this.authService.signup(credentials).subscribe({
        next: (response) => {
          console.log(`[LOGIN] Signup successful, redirecting to: ${this.returnUrl}`);
          // Refresh event tracking user ID to use authenticated user
          this.eventTrackingService.refreshUserId();
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error(`[LOGIN] Signup failed:`, error);
          this.handleAuthError(error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.signupForm);
    }
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: any): void {
    if (error.status === 401) {
      this.errorMessage = 'Invalid username or password';
    } else if (error.status === 409) {
      this.errorMessage = 'Username already exists';
    } else if (error.status === 400) {
      this.errorMessage = 'Please check your input and try again';
    } else {
      this.errorMessage = 'Something went wrong. Please try again later.';
    }
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must be less than ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  /**
   * Check if a field has errors and is touched
   */
  hasFieldError(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  /**
   * Check if password mismatch error exists
   */
  get hasPasswordMismatch(): boolean {
    return !!(this.signupForm.errors?.['passwordMismatch'] && 
             this.signupForm.get('confirmPassword')?.touched);
  }
}
