import { Routes } from '@angular/router';
import { ParadoxComponent } from './paradox/paradox.component';
import { LabComponent } from './lab/lab.component';
import { MapComponent } from './map/map/map.component';
import { MCAdminComponent } from './mc/mcadmin/mcadmin.component';
import { MegaCampaignComponent } from './mc/mega-campaign/mega-campaign.component';
import { MCSignupComponent } from './mc/mcsignup/mcsignup.component';
import { SaveViewSplashComponent } from './save-view-splash/save-view-splash.component';
import { LineviewerComponent } from './lineviewer/lineviewer.component';
import { MegaModderComponent } from './mc/mega-modder/mega-modder.component';

export const routes: Routes = [
    {
        path: '',
        component: ParadoxComponent,
        children: [
            { path: 'save', component: SaveViewSplashComponent },
            { path: 'map', component: MapComponent },
            { path: 'lab', component: LabComponent },
            { path: 'stonks', component: LineviewerComponent },
            { path: 'mc', component: MegaCampaignComponent },
            { path: 'mc/admin', component: MCAdminComponent },
            {path: 'mc/modder', component: MegaModderComponent},
        ]
    }
];