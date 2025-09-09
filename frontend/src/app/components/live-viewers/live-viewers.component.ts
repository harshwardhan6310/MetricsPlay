import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { WebSocketService, ViewerUpdate } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-live-viewers',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatChipsModule],
  templateUrl: './live-viewers.component.html',
  styleUrls: ['./live-viewers.component.scss']
})
export class LiveViewersComponent implements OnInit, OnDestroy {
  @Input() filmId!: number;
  
  viewerCount = 0;
  isConnected = false;
  isUpdating = false;
  
  private websocketSubscription: Subscription | null = null;
  private updateTimeout: any;

  constructor(
    private webSocketService: WebSocketService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    if (!this.filmId) {
      console.error('[LIVE-VIEWERS] No filmId provided');
      return;
    }

    console.log(`[LIVE-VIEWERS] Initializing for film: ${this.filmId}`);
    
    // Subscribe to WebSocket connection status
    this.webSocketService.connectionStatus$.subscribe(connected => {
      this.isConnected = connected;
      console.log(`[LIVE-VIEWERS] WebSocket connected: ${connected}`);
    });

    // Subscribe to viewer updates for this specific film
    this.websocketSubscription = this.webSocketService.viewerUpdates$.subscribe((event: ViewerUpdate | null) => {
      if (event && event.type === 'concurrent_viewers' && event.filmId === this.filmId) {
        this.updateViewerCount(event.count);
      }
    });

    // Fetch initial viewer count
    this.fetchInitialViewerCount();
  }

  ngOnDestroy() {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
  }

  private async fetchInitialViewerCount() {
    try {
      // Use the existing ViewerController endpoint through Angular proxy
      const response = await this.http.get<{filmId: number, viewerCount: number, timestamp: number}>(`/api/viewers/film/${this.filmId}/count`).toPromise();
      if (response) {
        this.viewerCount = response.viewerCount || 0;
        console.log(`[LIVE-VIEWERS] Initial viewer count for film ${this.filmId}: ${this.viewerCount}`);
      }
    } catch (error) {
      console.error('[LIVE-VIEWERS] Error fetching initial viewer count:', error);
      this.viewerCount = 0; 
    }
  }

  private updateViewerCount(newCount: number) {
    console.log(`[LIVE-VIEWERS] Updating viewer count from ${this.viewerCount} to ${newCount}`);
    
    if (newCount !== this.viewerCount) {
      this.viewerCount = newCount;
      
      // Show update animation
      this.isUpdating = true;
      
      // Clear previous timeout
      if (this.updateTimeout) {
        clearTimeout(this.updateTimeout);
      }
      
      // Remove animation after 500ms
      this.updateTimeout = setTimeout(() => {
        this.isUpdating = false;
      }, 500);
    }
  }
}
