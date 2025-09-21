import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { FilmService, Film } from '../../services/film.service';
import { EventTrackingService } from '../../services/event-tracking.service';
import { LiveViewersComponent } from '../../components/live-viewers/live-viewers.component';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressBarModule,
    MatChipsModule,
    LiveViewersComponent
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  
  film: Film | null = null;
  filmId: number | null = null;
  loading = true;
  error: string | null = null;
  
  // Video tracking variables
  sessionId: string = '';
  private lastProgressTime = 0;
  private progressInterval = 15; // Send progress every 15 seconds
  private username : string = 'testuser1';
  private filmUpdateSubscription: Subscription | null = null;
  
  // Video state
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  progress = 0;
  volume = 1;
  isFullscreen = false;
  
  // Control visibility
  controlsVisible = true;
  private controlsTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private filmService: FilmService,
    private http: HttpClient,
    private eventTrackingService: EventTrackingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get film ID from route
    this.username = this.authService.getCurrentUser()?.username || "testuser1"; 
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.filmId = +id;
        this.loadFilm();
      } else {
        this.error = 'No film ID provided';
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    // Clear control timeout
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    
    // Always send pause event when component is destroyed to remove from concurrent viewers
    // This handles tab close, page refresh, navigation away, etc.
    if (this.videoElement && this.film) {
      this.eventTrackingService.trackVideoPause(
        this.film.id.toString(),
        this.currentTime,
        this.duration
      ).subscribe({
        next: () => console.log('Cleanup: Removed viewer session on component destroy'),
        error: (err) => console.error('Failed to remove viewer session:', err)
      });
    }

    // Unsubscribe from film updates
    if (this.filmUpdateSubscription) {
      this.filmUpdateSubscription.unsubscribe();
    }
  }

  loadFilm() {
    if (!this.filmId) return;
    
    this.filmService.getFilm(this.filmId).subscribe({
      next: (film) => {
        this.film = film;
        this.loading = false;
        this.initializePlayer();
      },
      error: (error) => {
        console.error('Error loading film:', error);
        this.error = 'Failed to load film';
        this.loading = false;
      }
    });
  }

  initializePlayer() {
    if (!this.film) return;
    
    // Generate session ID
    this.sessionId = `${this.film.id}_${this.username}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Setup video event listeners after view init
    setTimeout(() => {
      this.loadVideoWithAuth();
      this.setupVideoEventListeners();
    }, 100);
  }

  private loadVideoWithAuth() {
  if (!this.film) return;
  
  console.log('[VIDEO] Loading video with auth for film:', this.film.id);
  
  // Use HttpClient to fetch video with auth headers
  this.http.get(`/api/films/${this.film.id}/stream`, { 
    responseType: 'blob',
    observe: 'response'
  }).subscribe({
    next: (response) => {
      console.log('[VIDEO] Video blob received, setting video source');
      if (response.body && this.videoElement) {
        const videoUrl = URL.createObjectURL(response.body);
        this.videoElement.nativeElement.src = videoUrl;
        console.log('[VIDEO] Video source set successfully');
        this.currentTime = 0;
        this.duration = 0;
        this.progress = 0;
        this.lastProgressTime = 0;
      }
    },
    error: (error) => {
      console.error('[VIDEO] Error loading video stream:', error);
      this.error = 'Failed to load video stream';
    }
  });
}

  setupVideoEventListeners() {
    if (!this.videoElement) return;
    
    const video = this.videoElement.nativeElement;
    
    // Play event
    video.addEventListener('play', () => {
      console.log(`Play event - Film ${this.filmId}`);
      this.isPlaying = true;
      if (this.film) {
        this.eventTrackingService.trackVideoPlay(
          this.film.id.toString(),
          this.currentTime,
          this.duration
        ).subscribe();
        this.lastProgressTime = Math.max(0, Math.floor(video.currentTime));
        this.eventTrackingService.trackVideoProgress(
          this.film.id.toString(),
          video.currentTime,
          video.duration
        ).subscribe();
      }
      // Auto-hide controls when playing
      this.showControls();
    });
    
    // Pause event
    video.addEventListener('pause', () => {
      console.log(`Pause event - Film ${this.filmId} at ${video.currentTime}s`);
      this.isPlaying = false;
      if (this.film) {
        this.eventTrackingService.trackVideoPause(
          this.film.id.toString(),
          this.currentTime,
          this.duration
        ).subscribe();
      }
      // Show controls when paused
      this.controlsVisible = true;
      if (this.controlsTimeout) {
        clearTimeout(this.controlsTimeout);
        this.controlsTimeout = null;
      }
    });
    
    // Seek event
    video.addEventListener('seeked', () => {
      console.log(`Seek event - Film ${this.filmId} to ${video.currentTime}s`);
      if (this.film) {
        this.eventTrackingService.trackVideoSeek(
          this.film.id.toString(),
          this.currentTime,
          this.duration
        ).subscribe();
      }
      this.lastProgressTime = Math.floor(video.currentTime);
    });
    
    // Video ended
    video.addEventListener('ended', () => {
      console.log(`Ended event - Film ${this.filmId}`);
      this.isPlaying = false;
      if (this.film) {
        this.eventTrackingService.trackVideoEnded(
          this.film.id.toString(),
          this.currentTime,
          this.duration
        ).subscribe();
      }
    });
    
    // Progress tracking
    video.addEventListener('timeupdate', () => {
      // Skip if not in a valid state to report progress
      if (video.paused || video.seeking || isNaN(video.duration)) {
        return;
      }

      this.currentTime = video.currentTime;
      this.duration = video.duration;
      this.progress = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
      
      // Send progress events on fixed 15s buckets
      if (video.currentTime - this.lastProgressTime >= this.progressInterval) {
        console.log(`Progress event - Film ${this.filmId} at ${video.currentTime}s`);
        if (this.film) {
          this.eventTrackingService.trackVideoProgress(
            this.film.id.toString(),
            video.currentTime,
            video.duration
          ).subscribe();
        }
        // Align to the latest 15s bucket to avoid drift
        this.lastProgressTime = Math.floor(video.currentTime / this.progressInterval) * this.progressInterval;
      }
    });
    
    // Video loaded
    video.addEventListener('loadedmetadata', () => {
      console.log(`Loaded event - Film ${this.filmId}, Duration: ${video.duration}s`);
      this.duration = video.duration;
      // Reset baseline on new metadata
      this.lastProgressTime = 0;
    });
  }

  sendEvent(eventType: string) {
    if (!this.film || !this.videoElement) return;
    
    const video = this.videoElement.nativeElement;
    const event = {
      eventType: eventType,
      filmId: this.film.id,
      username: this.username,
      currentTime: Math.round(video.currentTime * 100) / 100,
      duration: Math.round(video.duration * 100) / 100,
      sessionId: this.sessionId
    };
    
    this.http.post('/api/events/video', event, { responseType: 'text' }).subscribe({
      next: (response) => {
        console.log(`Event tracked: ${eventType} for Film ${this.film?.id} at ${event.currentTime}s`);
      },
      error: (error) => {
        console.error('Error sending event:', error);
      }
    });
  }

  // Video control methods
  togglePlay() {
    if (!this.videoElement) return;
    
    const video = this.videoElement.nativeElement;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  seek(event: Event) {
    if (!this.videoElement) return;
    
    const target = event.target as HTMLInputElement;
    const video = this.videoElement.nativeElement;
    const seekTime = (parseFloat(target.value) / 100) * video.duration;
    video.currentTime = seekTime;
  }

  setVolume(event: Event) {
    if (!this.videoElement) return;
    
    const target = event.target as HTMLInputElement;
    const video = this.videoElement.nativeElement;
    video.volume = parseFloat(target.value) / 100;
  }

  toggleMute() {
    if (!this.videoElement) return;
    
    const video = this.videoElement.nativeElement;
    video.muted = !video.muted;
  }

  toggleFullscreen() {
    if (!this.videoElement) return;
    
    const video = this.videoElement.nativeElement;
    if (!document.fullscreenElement) {
      video.requestFullscreen();
      this.isFullscreen = true;
    } else {
      document.exitFullscreen();
      this.isFullscreen = false;
    }
    
    // Add fullscreen change event listener
    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement;
    });
  }

  goBack() {
    this.router.navigate(['/catalogue']);
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getGenreColor(genre: string): string {
    const colors: {[key: string]: string} = {
      'Documentary': 'primary',
      'Animation': 'accent',
      'Action': 'warn'
    };
    return colors[genre] || 'primary';
  }

  showControls() {
    this.controlsVisible = true;
    
    // Clear existing timeout
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    
    // Set timeout to hide controls after 3 seconds if playing
    if (this.isPlaying) {
      this.controlsTimeout = setTimeout(() => {
        this.controlsVisible = false;
      }, 3000);
    }
  }

  hideControls() {
    // Only hide if playing and not in fullscreen
    if (this.isPlaying && !this.isFullscreen) {
      // Add a slight delay before hiding
      setTimeout(() => {
        if (this.isPlaying) {
          this.controlsVisible = false;
        }
      }, 1000);
      
      if (this.controlsTimeout) {
        clearTimeout(this.controlsTimeout);
        this.controlsTimeout = null;
      }
    }
  }
}
