import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/catalogue', pathMatch: 'full' },
  { 
    path: 'catalogue', 
    loadComponent: () => import('./pages/catalogue/catalogue.component').then(m => m.CatalogueComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'live-feed', 
    loadComponent: () => import('./pages/live-feed/live-feed.component').then(m => m.LiveFeedComponent)
  },
  { 
    path: 'player', 
    loadComponent: () => import('./pages/player/player.component').then(m => m.PlayerComponent)
  },
  { 
    path: 'player/:id', 
    loadComponent: () => import('./pages/player/player.component').then(m => m.PlayerComponent)
  }
];
