import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/catalogue', pathMatch: 'full' },
  { 
    path: 'login', 
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'catalogue', 
    loadComponent: () => import('./pages/catalogue/catalogue.component').then(m => m.CatalogueComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'live-feed', 
    loadComponent: () => import('./pages/live-feed/live-feed.component').then(m => m.LiveFeedComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'player', 
    loadComponent: () => import('./pages/player/player.component').then(m => m.PlayerComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'player/:id', 
    loadComponent: () => import('./pages/player/player.component').then(m => m.PlayerComponent),
    canActivate: [AuthGuard]
  }
];
