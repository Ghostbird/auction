import { DEFAULT_CURRENCY_CODE, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuctionComponent } from './auction/auction.component';
import { ControlComponent } from './control/control.component';

@NgModule({
  declarations: [AppComponent, AuctionComponent, ControlComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [{ provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
