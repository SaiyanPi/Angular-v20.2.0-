import { Injectable, ResourceRef } from '@angular/core';
import { RaceModel } from '../models/race-model';
import { httpResource } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  // private readonly http = inject(HttpClient);
  // list() {
  //   const params = {
  //     status: 'PENDING'
  //   };
  //   return this.http.get<Array<RaceModel>>('https://ponyracer.ninja-squad.com/api/races', { params });
  // }

  list(): ResourceRef<Array<RaceModel> | undefined> {
    return httpResource<Array<RaceModel>>(() => ({
      url: 'https://ponyracer.ninja-squad.com/api/races',
      params: { status: 'PENDING' }
    }));
  }
}
