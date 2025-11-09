import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MfaComponent } from './mfa.component';

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: MfaComponent }
  ])],
  exports: [RouterModule]
})
export class MfaRoutingModule { }
