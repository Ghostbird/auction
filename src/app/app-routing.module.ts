import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuctionComponent } from 'src/app/auction/auction.component';
import { ControlComponent } from 'src/app/control/control.component';

const routes: Routes = [
  {
    path: 'control',
    component: ControlComponent,
  },
  {
    path: ':maximum/:time',
    component: AuctionComponent,
  },
  {
    path: ':maximum',
    component: AuctionComponent,
  },
  {
    path: '',
    component: AuctionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
