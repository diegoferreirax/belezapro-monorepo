import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly loggedIn = new BehaviorSubject<boolean>(false);
  public readonly isLoggedIn$ = this.loggedIn.asObservable();

  public login(): void {
    this.loggedIn.next(true);
  }

  public logout(): void {
    this.loggedIn.next(false);
  }
}
