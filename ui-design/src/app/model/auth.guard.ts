import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { UserService } from './user.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
	public jwtHelper: JwtHelperService = new JwtHelperService();
	constructor(private _userService: UserService, private _router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		if (localStorage.getItem('frontend-token')) {
			const decoded = this.jwtHelper.decodeToken(localStorage.getItem('frontend-token'));
			if (decoded.exp != undefined) {
				const date = new Date(0); 
    		date.setUTCSeconds(decoded.exp);
    		if(!(date.valueOf() > new Date().valueOf())) {
					this._router.navigate(['home']);
					location.reload();
    			return false;
    		} else {
    			if(decoded.isVerified == 0) {
						this._router.navigate(['home']);
						return false;
					}
    			return true;
    		}
			}
      return true;
    }

		console.log('location change without login');
		this._router.navigate(['home'], { queryParams: { returnUrl: state.url }});
		location.reload();
    return false;
	}

	canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		return this.canActivate(route, state);
	}

	checkLogin(url: string): boolean {
		let jwtValue: any = this._userService.getJWTValue();
		if (jwtValue != null) {
				return true;
		}
		else{
			this._router.navigate(['/home']);
		}
	}
}
