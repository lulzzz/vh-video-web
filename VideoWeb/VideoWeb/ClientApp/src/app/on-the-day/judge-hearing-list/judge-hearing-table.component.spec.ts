import { ConferenceTestData } from 'src/app/testing/mocks/data/conference-test-data';
import { JudgeHearingTableComponent } from './judge-hearing-table.component';
import { MockLogger } from 'src/app/testing/mocks/MockLogger';

describe('JudgeHearingTableComponent', () => {
  const component: JudgeHearingTableComponent = new JudgeHearingTableComponent(new MockLogger());

  beforeEach(() => {
    component.conferences = new ConferenceTestData().getTestData();
    component.ngOnInit();
  });

  it('should emit when conference has been selected', () => {
    spyOn(component.selectedConference, 'emit').and.callFake(() => { });
    const hearing = component.hearings[0];
    component.signIntoConference(hearing);
    expect(component.selectedConference.emit).toHaveBeenCalled();
  });
});
