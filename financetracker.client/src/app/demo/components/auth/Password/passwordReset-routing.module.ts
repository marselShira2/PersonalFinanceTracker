import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PasswordResetComponent } from './passwordReset.component';

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: PasswordResetComponent }
  ])],
  exports: [RouterModule]
})
export class PasswordResetRoutingModule { }
