import { inject, Injectable } from '@angular/core';
import { UserModel } from '../models/user-model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // authenticate(login: string; password: string): ResourceRef<Array<UserModel> | undefined> {
  //   return httpResource<Array<RaceModel>>(() => ({
  //     url: 'https://ponyracer.ninja-squad.com/api/races',
  //     params: { status: 'PENDING' }
  //   }));
  // }

  private readonly http = inject(HttpClient);
  // remember: this returns observable which we need to subsribe using .subscribe({...})
  // (see chapter 17 and chapter 15)
  authenticate(login: string, password: string) {
    return this.http.post<UserModel>('https://ponyracer.ninja-squad.com/api/users/authentication', { login, password }); // ⚠️ not params
  }
}
