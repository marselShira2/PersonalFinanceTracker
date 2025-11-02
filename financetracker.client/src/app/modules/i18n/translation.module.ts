import { NgModule } from '@angular/core';
import { TranslationService } from './translation.service';

@NgModule({
  providers: [TranslationService], // make it injectable
  exports: [], // no components to export yet
})
export class TranslationModule { }
