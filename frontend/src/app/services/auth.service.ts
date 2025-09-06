import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface User {
  username: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE = '/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USERNAME_KEY = 'username';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from cookies on startup
    this.loadUserFromCookies();
  }

  /**
   * Login user and store token in cookies
   */
  login(credentials: AuthRequest): Observable<AuthResponse> {
    console.log(`[AUTH] Attempting login for username: ${credentials.username}`);
    
    return this.http.post<AuthResponse>(`${this.API_BASE}/login`, credentials).pipe(
      tap(response => {
        console.log(`[AUTH] Login successful for username: ${credentials.username}`);
        this.setAuthData(credentials.username, response.token);
      }),
      catchError(error => {
        console.error(`[AUTH] Login failed for username: ${credentials.username}`, error);
        throw error;
      })
    );
  }

  /**
   * Register new user and store token in cookies
   */
  signup(credentials: AuthRequest): Observable<AuthResponse> {
    console.log(`[AUTH] Attempting signup for username: ${credentials.username}`);
    
    return this.http.post<AuthResponse>(`${this.API_BASE}/signup`, credentials).pipe(
      tap(response => {
        console.log(`[AUTH] Signup successful for username: ${credentials.username}`);
        this.setAuthData(credentials.username, response.token);
      }),
      catchError(error => {
        console.error(`[AUTH] Signup failed for username: ${credentials.username}`, error);
        throw error;
      })
    );
  }

  /**
   * Logout user and clear stored data
   */
  logout(): void {
    console.log(`[AUTH] Logging out user`);
    this.clearAuthData();
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.getCookie(this.TOKEN_KEY);
  }

  /**
   * Get current username
   */
  getUsername(): string | null {
    return this.getCookie(this.USERNAME_KEY);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Store token and username in cookies
   */
  private setAuthData(username: string, token: string): void {
    // Store in cookies
    this.setCookie(this.TOKEN_KEY, token, 7); // 7 days expiry
    this.setCookie(this.USERNAME_KEY, username, 7);
    
    // Update current user observable
    const user: User = { username, token };
    this.currentUserSubject.next(user);
    
    console.log(`User logged in: ${username}`);
  }

  /**
   * Clear all cookies and user data
   */
  private clearAuthData(): void {
    this.deleteCookie(this.TOKEN_KEY);
    this.deleteCookie(this.USERNAME_KEY);
    this.currentUserSubject.next(null);

    console.log(`User logged out`);
  }

  /**
   * Load user from cookies on startup
   */
  private loadUserFromCookies(): void {
    const token = this.getToken();
    const username = this.getUsername();
    
    if (token && username) {
      const user: User = { username, token };
      this.currentUserSubject.next(user);
      console.log(`User session loaded: ${username}`);
    }
  }

  /**
   * Set cookie helper
   */
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Get cookie helper
   */
  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Delete cookie helper
   */
  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}
