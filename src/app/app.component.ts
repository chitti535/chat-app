import { Component } from '@angular/core';
import { ChartService } from 'src/services/chart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'chart-app';

  constructor(chartService: ChartService) {

  }
}
