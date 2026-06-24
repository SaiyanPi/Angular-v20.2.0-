import { Injectable, ResourceRef } from '@angular/core';
import { RaceModel } from '../models/race-model';
import { httpResource } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RaceService {
  list(): ResourceRef<Array<RaceModel> | undefined> {
    return httpResource<Array<RaceModel>>(() => ({
      url: `${environment.baseUrl}/api/races`,
      params: { status: 'PENDING' }
    }));
  }
}
