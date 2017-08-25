// Vendor
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '@angular/material';

// Local
import { GenericApi } from './services/genericapi.service';
import { CapitalizePipe } from './pipes/capitalize.pipe';
import { SophisticationPipe } from './pipes/sophistication.pipe';
import { FieldSortPipe } from './pipes/field-sort.pipe';
import { RiskIcon } from './components/risk-icon/risk-icon.component';

@NgModule({
    imports: [CommonModule, MaterialModule],
    exports: [CapitalizePipe, SophisticationPipe, RiskIcon, FieldSortPipe],
    declarations: [CapitalizePipe, SophisticationPipe, RiskIcon, FieldSortPipe],
    providers: [GenericApi]
})

export class GlobalModule {}