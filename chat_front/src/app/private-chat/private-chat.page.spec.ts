import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivateChatPage } from './private-chat.page';

describe('PrivateChatPage', () => {
  let component: PrivateChatPage;
  let fixture: ComponentFixture<PrivateChatPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PrivateChatPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
