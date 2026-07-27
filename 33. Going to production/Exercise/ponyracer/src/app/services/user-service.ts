import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import { UserModel } from '../models/user-model';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { WsService } from './ws-service';
import { ScoreHistoryModel } from '../models/score-history-model';

const USER_LOCAL_STORAGE_KEY = 'rememberMe';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly user = signal<UserModel | undefined>(this.retrieveUser());
  readonly currentUser = this.user.asReadonly();

  public readonly wsService = inject(WsService);

  constructor() {
    effect(() => {
      // every time the user signal changes, we store it in local storage
      const user = this.user();
      untracked(() => {
        if (user) {
          window.localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(user));
        } else {
          window.localStorage.removeItem(USER_LOCAL_STORAGE_KEY);
        }
      });
    });
  }

  authenticate(login: string, password: string): Observable<UserModel> {
    return this.http
      .post<UserModel>(`${environment.baseUrl}/api/users/authentication`, { login, password }) // ⚠️ not params
      .pipe(tap(user => this.user.set(user)));
  }

  register(login: string, password: string, birthYear: number): Observable<UserModel> {
    const body = { login, password, birthYear };
    return this.http.post<UserModel>(`${environment.baseUrl}/api/users`, body);
  }

  logout(): void {
    this.user.set(undefined);
  }

  private retrieveUser(): UserModel | undefined {
    const value = window.localStorage.getItem(USER_LOCAL_STORAGE_KEY);
    if (value) {
      return JSON.parse(value) as UserModel;
    }
    return undefined;
  }

  scoreUpdates(userId: number): Observable<UserModel> {
    return this.wsService.connect<UserModel>(`/player/${userId}`);
  }

  getScoreHistory(): Observable<Array<ScoreHistoryModel>> {
    return this.http.get<Array<ScoreHistoryModel>>(`${environment.baseUrl}/api/money/history`);
  }
  // Observable<Array<ScoreHistoryModel>> and Observable<ScoreHistoryModel[]> are same thing
}
