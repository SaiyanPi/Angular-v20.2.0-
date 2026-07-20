import { inject, Injectable, ResourceRef } from '@angular/core';
import { LiveRaceModel, RaceModel } from '../models/race-model';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable, takeWhile } from 'rxjs';
import { WsService } from './ws-service';

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  private readonly http = inject(HttpClient);
  private readonly wsService = inject(WsService);

  list(status: 'PENDING' | 'RUNNING' | 'FINISHED'): ResourceRef<Array<RaceModel> | undefined> {
    return httpResource<Array<RaceModel>>(() => ({
      url: `${environment.baseUrl}/api/races`,
      params: { status }
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

  live(raceId: number): Observable<LiveRaceModel> {
    return this.wsService
      .connect<LiveRaceModel>(`/race/${raceId}`)
      .pipe(takeWhile(liveRace => liveRace.status !== 'FINISHED', /* include last value */ true));
  }

  boost(raceId: number, ponyId: number): Observable<void> {
    return this.http.post<void>(`${environment.baseUrl}/api/races/${raceId}/boosts`, { ponyId });
  }

}
