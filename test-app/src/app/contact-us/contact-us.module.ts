import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactUsRoutingModule } from './contact-us-routing.module';
import { ContactUsComponent } from './contact-us/contact-us.component';

@NgModule({
  imports: [
    CommonModule,
    ContactUsRoutingModule
  ],
  declarations: [ContactUsComponent]
})
export class ContactUsModule { }


