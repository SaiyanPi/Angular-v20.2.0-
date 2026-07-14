import { rxResource } from '@angular/core/rxjs-interop';
import { UserService } from '../services/user-service';
import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { Chart, Filler, Legend, LinearScale, LineController, LineElement, PointElement, TimeScale, Tooltip } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(LineController, LinearScale, TimeScale, PointElement, LineElement, Legend, Filler, Tooltip);

@Component({
  selector: 'pr-score-history',
  imports: [],
  templateUrl: './score-history.html',
  styleUrl: './score-history.css'
})
export class ScoreHistory {
  private readonly userService = inject(UserService);
  protected readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('chart');

  private readonly history = rxResource({
    stream: () => this.userService.getScoreHistory()
  })

  constructor() {
    effect(onCleanup => {
      const history = this.history.value();
      if (!history) {
        return;
      }
      const chart = new Chart(this.canvas().nativeElement, {
        type: 'line',
        data: {
          labels: history.map(event => event.instant),
          datasets: [
            {
              label: 'Score history',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              fill: 'origin',
              tension: 0.5,
              data: history.map(event => event.money)
            }
          ]
        },
        options: {
          scales: {
            x: {
              type: 'time'
            }
          }
        }
      });
      onCleanup(() => chart.destroy());
    });
  }
}
