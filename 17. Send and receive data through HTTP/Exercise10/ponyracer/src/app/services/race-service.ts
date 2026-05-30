import { inject, Injectable } from '@angular/core';
import { RaceModel } from '../models/race-model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  private readonly http = inject(HttpClient);
  list() {
    const params = {
      status: 'PENDING'
    };
    return this.http.get<Array<RaceModel>>('https://ponyracer.ninja-squad.com/api/races', { params });
  }
}
