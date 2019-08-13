import { NgModule } from "@angular/core";
import { SearchPipe } from "./pipe";

@NgModule({
  declarations: [SearchPipe],
  exports: [SearchPipe]
})
export class PipeModule {}
