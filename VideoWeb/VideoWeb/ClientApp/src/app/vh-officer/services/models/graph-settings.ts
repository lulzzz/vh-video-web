export const GraphLabel = {
  Poor: 'poor',
  Bad: 'bad',
  Good: 'good',
  Disconnected: 'disconnected'
};

export class GraphSettings {

  static MAX_RECORDS = 180;

  static getLineChartOptions() {

    return {
      scales: {
        yAxes: [{
          ticks: {
            suggestedMin: 0,
            stepSize: 5,
            suggestedMax: 25,
            display: false,
          },
          scaleLabel: {
            display: false,
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
            labelString: ' '
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
      },
      tooltips: {
        enabled: false,
      }
    };
  }

  static getlineChartColors() {
    return [
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
        borderWidth: 2
      },
      {
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,0,0)',
        borderWidth: 5
      },
    ];

  }

  static setScaleXLabels(chart, _ease) {

    const width = chart.width / 3;
    const ctx = chart.ctx;
    ctx.restore();

    ctx.textBaseline = 'middle';
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#777';
    const y = chart.height - 10;

    let text = '15m';
    let x = 10;
    ctx.fillText(text, x, y);

    text = '10m';
    x = width;
    ctx.fillText(text, x, y);

    text = '5m';
    x = width * 2;
    ctx.fillText(text, x, y);

    text = 'now';
    x = width * 3 - 30;
    ctx.fillText(text, x, y);

    ctx.save();
  }
}
