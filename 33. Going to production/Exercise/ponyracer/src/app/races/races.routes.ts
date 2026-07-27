import { Routes } from '@angular/router';
import { Races } from './races';
import { PendingRaces } from './pending-races/pending-races';
import { FinishedRaces } from './finished-races/finished-races';
import { Bet } from '../bet/bet';
import { Live } from '../live/live';

export const racesRoutes: Routes = [
  {
    path: '',
    component: Races,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pending' },
      { path: 'pending', component: PendingRaces },
      { path: 'finished', component: FinishedRaces }
    ]
  },
  { path: ':raceId', component: Bet },
  { path: ':raceId/live', component: Live }
];
