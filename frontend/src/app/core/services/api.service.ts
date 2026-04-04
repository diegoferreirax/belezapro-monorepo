import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HttpOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  
  // Controle Numérico the requisições paralelas para evitar false/negatives
  private activeRequests = 0;
  
  // O Signal de estado exportável
  public isLoading = signal<boolean>(false);

  private getFullUrl(path: string): string {
    return `${environment.apiUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  private startRequest() {
    this.activeRequests++;
    this.isLoading.set(this.activeRequests > 0);
  }

  private completeRequest() {
    this.activeRequests--;
    if (this.activeRequests < 0) this.activeRequests = 0;
    this.isLoading.set(this.activeRequests > 0);
  }

  get<T>(path: string, options?: HttpOptions): Observable<T> {
    this.startRequest();
    return this.http.get<T>(this.getFullUrl(path), options).pipe(
      finalize(() => this.completeRequest())
    );
  }

  post<T>(path: string, body: any, options?: HttpOptions): Observable<T> {
    this.startRequest();
    return this.http.post<T>(this.getFullUrl(path), body, options).pipe(
      finalize(() => this.completeRequest())
    );
  }

  put<T>(path: string, body: any, options?: HttpOptions): Observable<T> {
    this.startRequest();
    return this.http.put<T>(this.getFullUrl(path), body, options).pipe(
      finalize(() => this.completeRequest())
    );
  }

  patch<T>(path: string, body: any, options?: HttpOptions): Observable<T> {
    this.startRequest();
    return this.http.patch<T>(this.getFullUrl(path), body, options).pipe(
      finalize(() => this.completeRequest())
    );
  }

  delete<T>(path: string, options?: HttpOptions): Observable<T> {
    this.startRequest();
    return this.http.delete<T>(this.getFullUrl(path), options).pipe(
      finalize(() => this.completeRequest())
    );
  }
}
