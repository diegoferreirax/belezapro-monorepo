import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {provideRouter, withHashLocation} from '@angular/router';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';

import {routes} from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      ...(environment.useHashRouting ? [withHashLocation()] : [])
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor]))
  ],
};
