import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Event Models
export interface VideoEvent {
  filmId: string;
  userId: string;
  eventType: 'PLAY' | 'PAUSE' | 'PROGRESS' | 'SEEK' | 'ENDED';
  timestamp: string;
  currentTime: number;
  duration: number;
  sessionId: string;
}

export interface FilmMetrics {
  filmId: string;
  title: string;
  currentViewers: number;
  totalViews: number;
  averageWatchTime: number;
  completionRate: number;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventTrackingService {
  private readonly API_BASE = '/api';
  private sessionId: string;
  private userId: string | null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.sessionId = this.generateSessionId();
    this.userId = this.getCurrentUserId();
    
    // Subscribe to auth state changes to update user ID automatically
    this.authService.currentUser$.subscribe(user => {
      const newUserId = this.getCurrentUserId();
      if (this.userId !== newUserId) {
        console.log(`[EVENT-TRACKING] Auth state changed, updating user ID from ${this.userId || 'null'} to ${newUserId || 'null'}`);
        this.userId = newUserId;
      }
    });
  }

  // Video Event Tracking
  trackVideoPlay(filmId: string, currentTime: number, duration: number): Observable<any> {
    if (!this.userId) {
      console.log(`[EVENT-TRACKING] Skipping PLAY event - user not authenticated`);
      return new Observable(observer => observer.complete());
    }
    
    console.log(`[EVENT-TRACKING] Tracking PLAY event for film ${filmId} at ${currentTime}s`);
    const event: VideoEvent = {
      filmId,
      userId: this.userId,
      eventType: 'PLAY',
      timestamp: new Date().toISOString(),
      currentTime,
      duration,
      sessionId: this.sessionId
    };
    console.log(`[EVENT-TRACKING] PLAY event payload:`, event);
    return this.publishVideoEvent(event);
  }

  trackVideoPause(filmId: string, currentTime: number, duration: number): Observable<any> {
    if (!this.userId) {
      console.log(`[EVENT-TRACKING] Skipping PAUSE event - user not authenticated`);
      return new Observable(observer => observer.complete());
    }
    
    console.log(`[EVENT-TRACKING] Tracking PAUSE event for film ${filmId} at ${currentTime}s`);
    const event: VideoEvent = {
      filmId,
      userId: this.userId,
      eventType: 'PAUSE',
      timestamp: new Date().toISOString(),
      currentTime,
      duration,
      sessionId: this.sessionId
    };
    console.log(`[EVENT-TRACKING] PAUSE event payload:`, event);
    return this.publishVideoEvent(event);
  }

  trackVideoProgress(filmId: string, currentTime: number, duration: number): Observable<any> {
    if (!this.userId) {
      console.log(`[EVENT-TRACKING] Skipping PROGRESS event - user not authenticated`);
      return new Observable(observer => observer.complete());
    }
    
    console.log(`[EVENT-TRACKING] Tracking PROGRESS event for film ${filmId} at ${currentTime}s`);
    const event: VideoEvent = {
      filmId,
      userId: this.userId,
      eventType: 'PROGRESS',
      timestamp: new Date().toISOString(),
      currentTime,
      duration,
      sessionId: this.sessionId
    };
    console.log(`[EVENT-TRACKING] PROGRESS event payload:`, event);
    return this.publishVideoEvent(event);
  }

  trackVideoSeek(filmId: string, currentTime: number, duration: number): Observable<any> {
    if (!this.userId) {
      console.log(`[EVENT-TRACKING] Skipping SEEK event - user not authenticated`);
      return new Observable(observer => observer.complete());
    }
    
    console.log(`[EVENT-TRACKING] Tracking SEEK event for film ${filmId} to ${currentTime}s`);
    const event: VideoEvent = {
      filmId,
      userId: this.userId,
      eventType: 'SEEK',
      timestamp: new Date().toISOString(),
      currentTime,
      duration,
      sessionId: this.sessionId
    };
    console.log(`[EVENT-TRACKING] SEEK event payload:`, event);
    return this.publishVideoEvent(event);
  }

  trackVideoEnded(filmId: string, currentTime: number, duration: number): Observable<any> {
    if (!this.userId) {
      console.log(`[EVENT-TRACKING] Skipping ENDED event - user not authenticated`);
      return new Observable(observer => observer.complete());
    }
    
    console.log(`[EVENT-TRACKING] Tracking ENDED event for film ${filmId} at ${currentTime}s`);
    const event: VideoEvent = {
      filmId,
      userId: this.userId,
      eventType: 'ENDED',
      timestamp: new Date().toISOString(),
      currentTime,
      duration,
      sessionId: this.sessionId
    };
    console.log(`[EVENT-TRACKING] ENDED event payload:`, event);
    return this.publishVideoEvent(event);
  }

  // API Calls to Backend
  private publishVideoEvent(event: VideoEvent): Observable<any> {
    console.log(`[HTTP] Sending ${event.eventType} event to backend: ${this.API_BASE}/events/video`);
    return this.http.post(`${this.API_BASE}/events/video`, event, { 
      responseType: 'text' 
    }).pipe(
      tap(response => {
        console.log(`[HTTP] ${event.eventType} event sent successfully, response: ${response}`);
      }),
      catchError(error => {
        console.error(`[HTTP] Failed to send ${event.eventType} event:`, error);
        throw error;
      })
    );
  }

  // Analytics Data Fetching
  getFilmMetrics(filmId: string): Observable<FilmMetrics> {
    console.log(`[HTTP] Fetching film metrics for film ${filmId}`);
    return this.http.get<FilmMetrics>(`${this.API_BASE}/analytics/film/${filmId}/metrics`).pipe(
      tap(metrics => {
        console.log(`[HTTP] Film metrics received for film ${filmId}:`, metrics);
      }),
      catchError(error => {
        console.error(`[HTTP] Failed to fetch film metrics for film ${filmId}:`, error);
        throw error;
      })
    );
  }

  getCurrentViewers(filmId: string): Observable<number> {
    console.log(`[HTTP] Fetching current viewers for film ${filmId}`);
    return this.http.get<number>(`${this.API_BASE}/analytics/film/${filmId}/concurrent-viewers`).pipe(
      tap(count => {
        console.log(`[HTTP] Current viewers count for film ${filmId}: ${count}`);
      }),
      catchError(error => {
        console.error(`[HTTP] Failed to fetch current viewers for film ${filmId}:`, error);
        throw error;
      })
    );
  }

  getDashboardMetrics(): Observable<any> {
    console.log(`[HTTP] Fetching dashboard metrics`);
    return this.http.get(`${this.API_BASE}/analytics/dashboard`).pipe(
      tap(metrics => {
        console.log(`[HTTP] Dashboard metrics received:`, metrics);
      }),
      catchError(error => {
        console.error(`[HTTP] Failed to fetch dashboard metrics:`, error);
        throw error;
      })
    );
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getCurrentUserId(): string | null {
    // Only return user ID if user is authenticated
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.username) {
      console.log(`👤 [EVENT-TRACKING] Using authenticated user: ${currentUser.username}`);
      return currentUser.username;
    }
    
    console.log(`🔄 [EVENT-TRACKING] No authenticated user, tracking disabled`);
    return null;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getUserId(): string | null {
    return this.userId;
  }

  isTrackingEnabled(): boolean {
    return this.userId !== null;
  }

  refreshUserId(): void {
    const oldUserId = this.userId;
    this.userId = this.getCurrentUserId();
    if (oldUserId !== this.userId) {
      console.log(`🔄 [EVENT-TRACKING] User ID updated from ${oldUserId || 'null'} to ${this.userId || 'null'}`);
    }
  }
}
