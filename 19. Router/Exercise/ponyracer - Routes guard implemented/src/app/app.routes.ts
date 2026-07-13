import { Routes } from '@angular/router';
import { Home } from './home/home';
import { loggedInGuard } from './logged-in-guard';


export const routes: Routes = [
  { path: '', component: Home },
  // { path: 'races', component: Races },
  {
    path: 'races',
    canActivate: [loggedInGuard],
    // children: [
    //   { path: '', component: Races,
    //     children: [
    //       { path: '', pathMatch: 'full', redirectTo: 'pending' },
    //       { path: 'pending', component: PendingRaces },
    //       { path: 'finished', component: FinishedRaces }
    //     ]
    //   },
    //   { path: ':raceId', component: Bet },
    //   { path: ':raceId/live', component: Live }
    // ]
    loadChildren: () => import('./races/races.routes').then(m => m.racesRoutes)
  },
  // { path: 'login', component: Login },
  // { path: 'register', component: Register }
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./register/register').then(m => m.Register) }
];
