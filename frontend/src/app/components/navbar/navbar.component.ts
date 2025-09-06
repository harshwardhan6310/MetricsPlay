import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { EventTrackingService } from '../../services/event-tracking.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private eventTrackingService: EventTrackingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
        console.log(`🔄 [NAVBAR] User state updated:`, user?.username || 'Not logged in');
      }
    );
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  /**
   * Handle user logout
   */
  onLogout(): void {
    console.log(`🚪 [NAVBAR] User logout initiated`);
    this.authService.logout();
    // Refresh event tracking user ID to use guest user
    this.eventTrackingService.refreshUserId();
    this.router.navigate(['/login']);
  }
}
