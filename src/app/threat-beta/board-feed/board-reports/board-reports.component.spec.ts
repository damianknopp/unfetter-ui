import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';

import {
    MatBadgeModule,
    MatIconModule,
    MatProgressSpinnerModule,
} from '@angular/material';

import { BoardReportsComponent } from './board-reports.component';
import { FeedCarouselComponent } from '../../feed-carousel/feed-carousel.component';
import { ThreatDashboardBetaService } from '../../threat-beta.service';
import MockThreatDashboardBetaService from '../../testing/mock-threat.service';
import { LoadingSpinnerComponent } from '../../../global/components/loading-spinner/loading-spinner.component';
import { TimesPipe } from '../../../global/pipes/times.pipe';
import { reducers } from '../../../root-store/app.reducers';

describe('BoardReportsComponent', () => {

    let fixture: ComponentFixture<BoardReportsComponent>;
    let component: BoardReportsComponent;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                imports: [
                    MatBadgeModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                    StoreModule.forRoot(reducers),
                ],
                declarations: [
                    BoardReportsComponent,
                    FeedCarouselComponent,
                    LoadingSpinnerComponent,
                    TimesPipe,
                ],
                providers: [
                    { provide: ThreatDashboardBetaService, useValue: MockThreatDashboardBetaService },
                ]
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BoardReportsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    /*
     * TODO:
     * - give component a set size
     * - add store to load test reports
     * - ensure calculateWindows() was called on the carousel
     * - click approve on a potential report
     * - click reject on a potential report
     * - click approve on a vetted report (should not register)
     * - click reject on a vetted report
     * - click view on a report (currently does nothing)
     * - click share on a report (should not register)
     */

});
