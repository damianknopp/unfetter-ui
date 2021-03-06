import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CampaignsEditComponent } from '../campaigns-edit/campaigns-edit.component';
import { StixService } from '../../../stix.service';
import { Campaign, AttackPattern, Identity, IntrusionSet , Relationship } from '../../../../models';

@Component({
  selector: 'campaigns-new',
  templateUrl: './campaigns-new.component.html'
})

export class CampaignsNewComponent extends CampaignsEditComponent implements OnInit {
    public campaign: Campaign = new Campaign();
    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {

        super(stixService, route, router, dialog, location, snackBar);
    }

    public ngOnInit() { }

    public saveCampaign(): void {
       let subscription = super.create(this.campaign).subscribe(
            (data) => {
                super.saveRelationships(this.campaign);
                this.location.back();
            }, (error) => {
                // handle errors here
                 console.log('error ' + error);
            }, () => {
                // prevent memory links
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        );
    }
}
