import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      console.log(`[HTTP-INTERCEPTOR] Adding auth token to request: ${req.method} ${req.url}`);
      
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return next.handle(authReq);
    } else {
      console.log(`[HTTP-INTERCEPTOR] No token found for request: ${req.method} ${req.url}`);
      return next.handle(req);
    }
  }
}
