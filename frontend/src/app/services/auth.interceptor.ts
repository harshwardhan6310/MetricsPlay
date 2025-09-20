import { inject } from '@angular/core';
import {HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    console.log(`[HTTP-INTERCEPTOR] Adding auth token to request: ${req.method} ${req.url}`);
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(authReq);
  } else {
    console.log(`[HTTP-INTERCEPTOR] No token found for request: ${req.method} ${req.url}`);
    return next(req);
  }
};
