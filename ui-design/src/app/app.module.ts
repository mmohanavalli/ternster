import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";
import { GlobalService } from "./model/global.service";
import { UserService } from "./model/user.service";
import { AuthGuard } from "./model/auth.guard";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { PagesComponent } from "./pages/pages.component";
import { ToastrModule } from "ngx-toastr";
import {
  SocialLoginModule,
  AuthServiceConfig,
  GoogleLoginProvider,
  FacebookLoginProvider
} from "angular5-social-login";
import { LayoutComponent } from "./layout/layout.component";
import { SharedService } from "./model/shared.service";
import { HttpClientModule } from "@angular/common/http";

let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(
      // "289138184898-t4skcgaootjcqhlhldhabt6n0m5ech5n.apps.googleusercontent.com"
      "907104265855-iqdig8og9oata9nkjkiht1c5thogpv9c.apps.googleusercontent.com"
    )
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider("1158260991042381")
  }
]);

export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [AppComponent, PagesComponent, LayoutComponent ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    SocialLoginModule,
    HttpClientModule,
    ToastrModule.forRoot({
      timeOut: 6000,
      preventDuplicates: true
    })
  ],
  providers: [
    GlobalService,
    UserService,
    SharedService,
    AuthGuard,
    { provide: AuthServiceConfig, useFactory: provideConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
