import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LocalStorageRepository } from '../repositories/local-storage.repository';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const localStorageRepository = inject(LocalStorageRepository);
  const tokenObj = localStorageRepository.getRaw<{token: string}>('auth_token');

  if (tokenObj && tokenObj.token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${tokenObj.token}`
      }
    });
  }

  return next(req);
};
