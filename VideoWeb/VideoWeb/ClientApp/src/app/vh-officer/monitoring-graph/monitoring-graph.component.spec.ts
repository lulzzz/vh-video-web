import { MonitoringGraphComponent } from '../monitoring-graph/monitoring-graph.component';

describe('MonitoringGraphComponent', () => {
  const component = new MonitoringGraphComponent();
  it('should defined three chart lines', () => {
    component.ngOnInit();
    expect(component.lineChartData.length).toBe(3);
  });
  it('should defined the number of chart labels to be number of max records received for package lost', () => {
    component.ngOnInit();
    expect(component.lineChartLabels.length).toBe(component.MAX_RECORDS);
  });
  it('should convert package lost values to signal strangth', () => {
    const valuesPackageLost = [1, 10, 0, 100];
    const newValues = component.transferPackagesLost(valuesPackageLost);
    expect(newValues[0]).toBe(99);
    expect(newValues[1]).toBe(90);
    expect(newValues[2]).toBe(100);
    expect(newValues[3]).toBe(0);
  });
  it('should defined the signal strength by the last package lost value as bad ', () => {
    const valuesPackageLost = [1, 10, 0, 99];
   component.transferPackagesLost(valuesPackageLost);
    const lastValue = component.lastPackageLostValue;
    expect(lastValue).toBe('bad');
  });
  it('should defined the signal strength by the last package lost value as poor', () => {
    const valuesPackageLost = [1, 10, 0, 14];
    component.transferPackagesLost(valuesPackageLost);
    const lastValue = component.lastPackageLostValue;
    expect(lastValue).toBe('poor');
  });
  it('should defined the signal strength by the last package lost value as good', () => {
    const valuesPackageLost = [1, 10, 0, 5];
    component.transferPackagesLost(valuesPackageLost);
    const lastValue = component.lastPackageLostValue;
    expect(lastValue).toBe('good');
  });
  it('should defined the signal strength as disconnected if no data recieved', () => {
    const valuesPackageLost = [];
    component.transferPackagesLost(valuesPackageLost);
    const lastValue = component.lastPackageLostValue;
    expect(lastValue).toBe('disconnected');
  });
});
