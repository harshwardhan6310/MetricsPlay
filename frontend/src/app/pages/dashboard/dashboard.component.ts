import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

interface FilmStatistics {
  filmId: number;
  title: string;
  genre: string;
  totalViews: number;
  avgRating: number;
  retentionRate: number;
  totalWatchTime: string;
  activeViewers: number;
}

interface RecentActivity {
  username: string;
  filmTitle: string;
  action: string;
  timestamp: Date;
  currentTime?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Overview metrics
  totalFilms = 5;
  totalUsers = 124;
  activeViewers = 8;
  totalViews = 1247;

  // Film statistics
  filmStats: FilmStatistics[] = [
    {
      filmId: 1,
      title: 'Beautiful Flowers',
      genre: 'Documentary',
      totalViews: 342,
      avgRating: 4.7,
      retentionRate: 85,
      totalWatchTime: '28h 30m',
      activeViewers: 3
    },
    {
      filmId: 2,
      title: 'Space HD',
      genre: 'Documentary',
      totalViews: 289,
      avgRating: 4.8,
      retentionRate: 92,
      totalWatchTime: '42h 15m',
      activeViewers: 2
    },
    {
      filmId: 3,
      title: 'Steamboat Willie',
      genre: 'Animation',
      totalViews: 456,
      avgRating: 4.9,
      retentionRate: 78,
      totalWatchTime: '55h 42m',
      activeViewers: 3
    },
    {
      filmId: 4,
      title: 'Wildlife Adventure',
      genre: 'Documentary',
      totalViews: 98,
      avgRating: 4.5,
      retentionRate: 88,
      totalWatchTime: '20h 10m',
      activeViewers: 0
    },
    {
      filmId: 5,
      title: 'Pokemon Opening',
      genre: 'Animation',
      totalViews: 623,
      avgRating: 4.6,
      retentionRate: 72,
      totalWatchTime: '36h 25m',
      activeViewers: 0
    }
  ];

  // Recent activity
  recentActivity: RecentActivity[] = [
    {
      username: 'testuser1',
      filmTitle: 'Beautiful Flowers',
      action: 'started',
      timestamp: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      username: 'moviefan42',
      filmTitle: 'Space HD',
      action: 'paused',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      currentTime: '4:32'
    },
    {
      username: 'animation_lover',
      filmTitle: 'Steamboat Willie',
      action: 'ended',
      timestamp: new Date(Date.now() - 8 * 60 * 1000)
    },
    {
      username: 'nature_doc',
      filmTitle: 'Wildlife Adventure',
      action: 'seek',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      currentTime: '8:45'
    },
    {
      username: 'retro_gamer',
      filmTitle: 'Pokemon Opening',
      action: 'started',
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    }
  ];

  displayedColumns: string[] = ['title', 'genre', 'views', 'rating', 'retention', 'watchTime', 'activeViewers'];

  ngOnInit() {
    // Future: Load real data from backend
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Future: API calls to get real analytics data
    console.log('Loading dashboard data...');
  }

  getActionIcon(action: string): string {
    const icons: {[key: string]: string} = {
      'started': 'play_arrow',
      'paused': 'pause',
      'ended': 'stop',
      'seek': 'fast_forward',
      'resumed': 'play_arrow'
    };
    return icons[action] || 'info';
  }

  getActionColor(action: string): string {
    const colors: {[key: string]: string} = {
      'started': 'success',
      'paused': 'warning',
      'ended': 'primary',
      'seek': 'accent',
      'resumed': 'success'
    };
    return colors[action] || 'primary';
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  }
}
