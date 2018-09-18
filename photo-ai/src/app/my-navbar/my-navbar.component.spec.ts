
import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MyNavbarComponent } from './my-navbar.component';

describe('MyNavbarComponent', () => {
  let component: MyNavbarComponent;
  let fixture: ComponentFixture<MyNavbarComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatSidenavModule],
      declarations: [MyNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
