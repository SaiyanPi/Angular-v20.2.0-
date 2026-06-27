import { inject, Injectable, ResourceRef } from '@angular/core';
import { RaceModel } from '../models/race-model';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  private readonly http = inject(HttpClient);

  list(): ResourceRef<Array<RaceModel> | undefined> {
    return httpResource<Array<RaceModel>>(() => ({
      url: `${environment.baseUrl}/api/races`,
      params: { status: 'PENDING' }
    }));
  }

  bet(raceId: number, ponyId: number): Observable<void> {
    return this.http.post<void>(`${environment.baseUrl}/api/races/${raceId}/bets`, { ponyId });
  }

  get(raceId: () => number): ResourceRef<RaceModel | undefined> {
    return httpResource<RaceModel>(() => `${environment.baseUrl}/api/races/${raceId()}`);
  }

  cancelBet(raceId: number): Observable<void> {
    return this.http.delete<void>(`${environment.baseUrl}/api/races/${raceId}/bets`);
  }
}
