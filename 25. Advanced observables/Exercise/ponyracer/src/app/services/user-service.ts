import { inject, Injectable, signal } from '@angular/core';
import { UserModel } from '../models/user-model';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly user = signal<UserModel | undefined>(undefined);
  readonly currentUser = this.user.asReadonly();

  authenticate(login: string, password: string): Observable<UserModel> {
    return this.http
    .post<UserModel>(`${environment.baseUrl}/api/users/authentication`, { login, password }) // ⚠️ not params
    .pipe(tap(user => this.user.set(user)))
  }

  register(login: string, password: string, birthYear: number): Observable<UserModel> {
    const body = { login, password, birthYear };
    return this.http.post<UserModel>(`${environment.baseUrl}/api/users`, body);
  }

  logout(): void {
    this.user.set(undefined);
  }
}
