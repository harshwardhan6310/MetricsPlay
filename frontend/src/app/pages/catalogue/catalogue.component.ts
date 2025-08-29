import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule, Router } from '@angular/router';
import { FilmService, Film } from '../../services/film.service';

@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule,
    RouterModule
  ],
  templateUrl: './catalogue.component.html',
  styleUrl: './catalogue.component.scss'
})
export class CatalogueComponent implements OnInit {
  films: Film[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private filmService: FilmService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFilms();
  }

  loadFilms() {
    this.filmService.getAllFilms().subscribe({
      next: (films) => {
        this.films = films;
        this.loading = false;
        console.log('Loaded films:', films);
      },
      error: (error) => {
        console.error('Error loading films:', error);
        this.error = 'Failed to load films';
        this.loading = false;
      }
    });
  }

  playFilm(film: Film) {
    // Navigate to player with film ID
    console.log('Playing film:', film);
    this.router.navigate(['/player', film.id]);
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
