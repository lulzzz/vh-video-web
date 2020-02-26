import { Component, OnInit, Input } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-monitoring-graph',
  templateUrl: './monitoring-graph.component.html',
  styleUrls: ['./monitoring-graph.component.css']
})
export class MonitoringGraphComponent implements OnInit {

  @Input('pakagesLostData')
  set packagesLostData(value: number[]) {
    this.transferPackagesLost(value);
  };

  @Input('participantName')
  participantName: string;

  packagesLostValues: number[] = [];
  lineChartData: ChartDataSets[] = [];
  lineChartLabels: Label[] = [];
  lineChartLegend = false;
  lineChartType = 'line';
  lineChartPlugins = [];

  lastPoint: number
  MAX_RECORDS = 180;

  lineChartOptions = {
    scales: {
      yAxes: [{
        ticks: {
          suggestedMin: 0,
          stepSize: 40,
          suggestedMax: 100,
          display: false,
        },
        scaleLabel: {
          display: true,
          labelString: 'Signal strength'
        }
      }],
      xAxes: [{
        ticks: {
          suggestedMin: 0,
          suggestedMax: this.MAX_RECORDS,
          display: false,
        },
        scaleLabel: {
          display: true,
          labelString: 'Time line 15 minuts'
        }
      }]
    },
    responsive: true,
    elements:
    {
      point:
      {
        pointStyle: 'line',
        radius: 0,
      }
    }

  };

  lineChartColors: Color[] = [
    {
      borderColor: '#ffab00',
      backgroundColor: 'rgba(0,0,0,0)',
      borderDash: [5, 5]
    },
    {
      borderColor: 'red',
      backgroundColor: 'rgba(0,0,0,0)',
      borderDash: [5, 5]
    },
    {
      borderColor: 'black',
      backgroundColor: 'rgba(0,0,0,0)',
      borderWidth: 1
    },
  ];

  ngOnInit() {
    this.lineChartData.push({ data: Array.from(Array(this.MAX_RECORDS), () => 90), label: 'Poor' });
    this.lineChartData.push({ data: Array.from(Array(this.MAX_RECORDS), () => 75), label: 'Bad' });
    this.lineChartData.push({ data: this.packagesLostValues, label: 'Signal' });

    this.lineChartLabels = Array.from(Array(this.MAX_RECORDS), (item, index) => index.toString());

  }

  transferPackagesLost(value: number[]) {
    if (value.length > 0) {
      this.lastPoint = value[value.length - 1];
      this.packagesLostValues = value.map(x => 100 - x);
    } else {
      this.lastPoint = -1;
      this.packagesLostValues.push(0);
    }
  }

  get lastPackageLostValue() {
    if (this.lastPoint >=100) { return 'disconnected';}
    if (this.lastPoint >= 10 && this.lastPoint < 15) {
      return 'poor';
    } else if (this.lastPoint >= 15 && this.lastPoint < 100) {
      return 'bad';
    }
    return 'good';
  }
}
