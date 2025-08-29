import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 24px; text-align: center;">
      <h1>🔴 Live Feed</h1>
      <p>Real-time user activity coming soon!</p>
    </div>
  `
})
export class LiveFeedComponent {
}
