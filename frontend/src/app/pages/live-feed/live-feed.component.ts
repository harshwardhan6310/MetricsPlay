import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { WebSocketService, LiveEvent } from '../../services/websocket.service';
import { FilmService } from '../../services/film.service';
import { Subscription } from 'rxjs';

interface LiveActivity {
  id: string;
  username: string;
  filmTitle: string;
  action: 'PLAY' | 'PAUSE' | 'SEEK' | 'ENDED' | 'PROGRESS';
  timestamp: Date;
  currentTime?: string;
  filmId: string;
  sessionId: string;
}

@Component({
  selector: 'app-live-feed',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatChipsModule,
    MatBadgeModule
  ],
  templateUrl: './live-feed.component.html',
  styleUrl: './live-feed.component.scss'
})
export class LiveFeedComponent implements OnInit, OnDestroy {
  isConnected = false;
  liveActivities: LiveActivity[] = [];
  currentViewers = 0;
  
  private webSocketSubscription: Subscription | null = null;
  private connectionSubscription: Subscription | null = null;
  private liveEventsSubscription: Subscription | null = null;
  
  // Film title cache to avoid repeated API calls
  private filmTitlesCache = new Map<string, string>();

  constructor(
    private webSocketService: WebSocketService,
    private filmService: FilmService
  ) {}

  ngOnInit() {
    // Subscribe to WebSocket connection status
    this.connectionSubscription = this.webSocketService.connectionStatus$.subscribe(
      (connected: boolean) => {
        this.isConnected = connected;
        console.log('[LIVE-FEED] WebSocket connection status:', connected);
      }
    );

    // Subscribe to live events from Kafka
    this.liveEventsSubscription = this.webSocketService.liveEvents$.subscribe(
      (event: LiveEvent | null) => {
        if (event) {
          this.processLiveEvent(event);
        }
      }
    );

    // Use viewer updates from real-time analytics instead of dashboard updates
    this.webSocketSubscription = this.webSocketService.viewerUpdates$.subscribe(
      (update) => {
        if (update && update.type === 'total_viewers') {
          // Sum up all concurrent viewers across films for total count
          this.currentViewers = update.count;
          console.log('[LIVE-FEED] Total viewers updated:', this.currentViewers);
        }
      }
    );

    // Pre-load all film titles for caching
    this.preloadFilmTitles();
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
    
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }

    if (this.liveEventsSubscription) {
      this.liveEventsSubscription.unsubscribe();
    }
  }

  private async processLiveEvent(event: LiveEvent): Promise<void> {
    // Get film title (with caching)
    const filmTitle = await this.getFilmTitle(event.filmId);
    
    // Convert Kafka event to LiveActivity
    const activity: LiveActivity = {
      id: event.eventId,
      username: event.userId,
      filmTitle: filmTitle,
      action: event.eventType,
      timestamp: new Date(event.timestamp),
      currentTime: this.formatTime(event.currentTime),
      filmId: event.filmId,
      sessionId: event.sessionId
    };

    // Add to beginning of array and limit to 50 most recent
    this.liveActivities.unshift(activity);
    if (this.liveActivities.length > 50) {
      this.liveActivities = this.liveActivities.slice(0, 50);
    }

    console.log('[LIVE-FEED] Added new activity:', activity);
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getActionIcon(action: string): string {
    const icons: {[key: string]: string} = {
      'PLAY': 'play_arrow',
      'PAUSE': 'pause', 
      'SEEK': 'fast_forward',
      'ENDED': 'stop',
      'PROGRESS': 'update'
    };
    return icons[action] || 'info';
  }

  getActionColor(action: string): string {
    const colors: {[key: string]: string} = {
      'PLAY': 'success',
      'PAUSE': 'warning',
      'SEEK': 'accent', 
      'ENDED': 'primary',
      'PROGRESS': 'info'
    };
    return colors[action] || 'primary';
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }
  }

  getActionText(action: string): string {
    const actionTexts: {[key: string]: string} = {
      'PLAY': 'started watching',
      'PAUSE': 'paused',
      'SEEK': 'jumped to',
      'ENDED': 'finished watching',
      'PROGRESS': 'is watching'
    };
    return actionTexts[action] || 'interacted with';
  }

  trackByActivityId(index: number, activity: LiveActivity): string {
    return activity.id;
  }

  // Film title caching methods
  private preloadFilmTitles(): void {
    this.filmService.getAllFilms().subscribe({
      next: (films) => {
        films.forEach(film => {
          this.filmTitlesCache.set(film.id.toString(), film.title);
        });
        console.log(`[LIVE-FEED] Preloaded ${films.length} film titles`);
      },
      error: (error) => {
        console.error('[LIVE-FEED] Error preloading film titles:', error);
      }
    });
  }

  private async getFilmTitle(filmId: string): Promise<string> {
    // Check cache first
    if (this.filmTitlesCache.has(filmId)) {
      return this.filmTitlesCache.get(filmId)!;
    }

    // If not in cache, try to fetch it
    try {
      const film = await this.filmService.getFilm(Number(filmId)).toPromise();
      if (film) {
        this.filmTitlesCache.set(filmId, film.title);
        console.log(`[LIVE-FEED] Cached film title: ${film.title}`);
        return film.title;
      }
    } catch (error) {
      console.warn(`[LIVE-FEED] Could not fetch title for film ${filmId}:`, error);
    }

    // Fallback to film ID
    const fallbackTitle = `Film ${filmId}`;
    this.filmTitlesCache.set(filmId, fallbackTitle); // Cache the fallback too
    return fallbackTitle;
  }
}
