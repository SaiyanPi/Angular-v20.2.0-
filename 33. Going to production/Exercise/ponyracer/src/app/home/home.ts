import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../services/user-service';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'pr-home',
  imports: [RouterLink, TranslocoDirective],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  protected readonly user = inject(UserService).currentUser;
}
