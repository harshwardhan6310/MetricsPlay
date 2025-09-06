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
  avgWatchTime: string;
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
  // Overview metrics (static analytics)
  totalFilms = 5;
  totalUsers = 124;
  totalViews = 1247;
  avgSessionDuration = '8m 32s';

  // Film statistics for analytics
  filmStats: FilmStatistics[] = [
    {
      filmId: 1,
      title: 'Beautiful Flowers',
      genre: 'Documentary',
      totalViews: 342,
      avgRating: 4.7,
      retentionRate: 85,
      totalWatchTime: '28h 30m',
      avgWatchTime: '5m 2s'
    },
    {
      filmId: 2,
      title: 'Space HD',
      genre: 'Documentary',
      totalViews: 289,
      avgRating: 4.8,
      retentionRate: 92,
      totalWatchTime: '42h 15m',
      avgWatchTime: '8m 46s'
    },
    {
      filmId: 3,
      title: 'Steamboat Willie',
      genre: 'Animation',
      totalViews: 456,
      avgRating: 4.9,
      retentionRate: 78,
      totalWatchTime: '55h 42m',
      avgWatchTime: '7m 20s'
    },
    {
      filmId: 4,
      title: 'Wildlife Adventure',
      genre: 'Documentary',
      totalViews: 98,
      avgRating: 4.5,
      retentionRate: 88,
      totalWatchTime: '20h 10m',
      avgWatchTime: '12m 22s'
    },
    {
      filmId: 5,
      title: 'Pokemon Opening',
      genre: 'Animation',
      totalViews: 623,
      avgRating: 4.6,
      retentionRate: 72,
      totalWatchTime: '36h 25m',
      avgWatchTime: '3m 30s'
    }
  ];

  displayedColumns: string[] = ['title', 'genre', 'views', 'rating', 'retention', 'watchTime'];

  constructor() {}

  ngOnInit() {
    console.log('Dashboard loaded with static analytics');
  }

  getGenreColor(genre: string): string {
    const colors: {[key: string]: string} = {
      'Documentary': 'primary',
      'Animation': 'accent',
      'Action': 'warn'
    };
    return colors[genre] || 'primary';
  }
}
