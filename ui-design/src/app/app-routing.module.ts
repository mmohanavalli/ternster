import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagesComponent } from './pages/pages.component';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './model/auth.guard';

const routes: Routes = [
	{
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: 'home',
        loadChildren: './pages/home/home.module#HomeModule'
      },
      {
        path: 'createtrip',
        canActivate: [AuthGuard],
        loadChildren: './pages/createtrip/createtrip.module#CreatetripModule'
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        loadChildren: './pages/dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'favorites',
        canActivate: [AuthGuard],
        loadChildren: './pages/favorites/favorites.module#FavoritesModule'
      },
      // {
      //   path: 'profile',
      //   canActivate: [AuthGuard],
      //   loadChildren: './pages/profile/profile.module#ProfileModule'
      // },
	    {
        path: 'findatrips',
        canActivate: [AuthGuard],
        loadChildren: './pages/findatrips/findatrips.module#FindatripsModule'
      },
      {
        path: 'authorize/:id',
        loadChildren: './pages/authorize/authorize.module#AuthorizeModule'
      },
	    {
        path: 'tripdetails',
        canActivate: [AuthGuard],
        loadChildren: './pages/tripdetails/tripdetails.module#TripdetailsModule'
      },      
	    {
        path: 'persondetails',
        canActivate: [AuthGuard],
        loadChildren: './pages/persondetails/persondetails.module#PersondetailsModule'
      },
      {
        path: 'createrequest',
        canActivate: [AuthGuard],
        loadChildren: './pages/shipment/shipment.module#ShipmentModule'
      },
      {
        path: 'viewrequest',
        canActivate: [AuthGuard],
        loadChildren: './pages/viewshipment/viewshipment.module#ViewshipmentModule'
      },
      {
        path: 'usertrips',
        canActivate: [AuthGuard],
        loadChildren: './pages/usertrips/usertrips.module#UsertripsModule'
      },
      {
        path: 'basicprofile',
        canActivate: [AuthGuard],
        loadChildren: './pages/basicprofile/basicprofile.module#BasicprofileModule'
      },
      {
        path: 'edittrip',
        canActivate: [AuthGuard],
        loadChildren: './pages/edittrip/edittrip.module#EdittripModule'
      },
      {
        path: 'updaterequest',
        canActivate: [AuthGuard],
        loadChildren: './pages/editshipment/editshipment.module#EditshipmentModule'
      },
      {
        path: 'notifications',
        canActivate: [AuthGuard],
        loadChildren: './pages/notifications/notifications.module#NotificationsModule'
      },
      {
        path: 'feedback/:userid/:id/:token',
        canActivate: [AuthGuard],
        loadChildren: './pages/feedback/feedback.module#FeedbackModule'
      },
      {
        path: 'tripaction',
        canActivate: [AuthGuard],
        loadChildren: './pages/tripaction/tripaction.module#TripactionModule'
      },
      
      {
        path: 'accounts',            
        canActivate: [AuthGuard],
        loadChildren: './pages/accounts/accounts.module#AccountsModule'
      },
      {
        path: 'terms',
        loadChildren: './pages/terms/terms.module#TermsModule'
      },
	  {
        path: 'about',
        loadChildren: './pages/about/about.module#AboutModule'
      },
	   {
        path: 'contact',
        loadChildren: './pages/contact/contact.module#ContactModule'
      },
	    {
        path: 'privacy',
        loadChildren: './pages/privacy/privacy.module#PrivacyModule'
      },
      {
        path: '404',
        loadChildren: './pages/error404/error404.module#Error404Module',
      },
      
	  ]
  },
  
  // {
  //   path:'passwordreset/:id',
  //   component: LayoutComponent,
  //   loadChildren : './forgotpassword/forgotpassword.module#ForgotpasswordModule'
  // }

  {
    path:'passwordreset/:id',
    component: LayoutComponent,
    loadChildren : './resetpassword/resetpassword.module#ResetpasswordModule'
  },
  { path: '**', redirectTo: '404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
