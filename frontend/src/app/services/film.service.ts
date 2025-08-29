import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Film {
  id: number;
  title: string;
  description: string;
  genre: string;
  videoUrl: string;
  duration: string;
  comments: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  username: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class FilmService {
  private apiUrl = '/api/films';

  constructor(private http: HttpClient) { }

  getAllFilms(): Observable<Film[]> {
    return this.http.get<Film[]>(`${this.apiUrl}`);
  }

  getFilm(id: number): Observable<Film> {
    return this.http.get<Film>(`${this.apiUrl}/${id}`);
  }
}
