import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable()
export class SharedService {
  private tripDetailsData: any;
  private tripFindData: any;
  private myTrip: any;
  private trip_id: any;
  private tabName: any;
  private tripSearchDataSource = new BehaviorSubject<Object>(null);
  public _tripSearchData: Observable<any> = this.tripSearchDataSource.asObservable();
  private personDataSource = new BehaviorSubject<Object>(null);
  private personData: Observable<any> = this.personDataSource.asObservable();;


  constructor() {}

  set tripSearchData(tripDetails: any) {
    this.tripSearchDataSource.next(tripDetails);
  }

  get tripSearchData() {
    return this._tripSearchData;
  }

  set gotoPersonDetailsPage(personData: any) {
    // this.personData = personData;
    this.personDataSource.next(personData);

  }

  get gotoPersonDetailsPage() {
    return this.personData;
  }

  set gotoMyTripsPage(myTrip) {
    this.myTrip = myTrip;
  }

  get gotoMyTripsPage() {
    return this.myTrip;
  }

  set gotoEditTripPage(trip_id) {
    this.trip_id = trip_id;
  }

  get gotoEditTripPage() {
    return this.trip_id;
  }

 

  set gotoUserTripsPage(personData) {
    this.personData = personData;
  }

  get gotoUserTripsPage() {
    return this.personData;
  }

  set gotoTripDetailsPageWithTripData(tripDetailsData) {
    this.tripDetailsData = tripDetailsData;
  }

  get gotoTripDetailsPageWithTripData() {
    return this.tripDetailsData;
  }

  set gotoFindTripPageWithTripData(tripFindData) {
    this.tripFindData = tripFindData;
  }

  get gotoFindTripPageWithTripData() {
    return this.tripFindData;
  }

  set gotoProfilePage(tabName) {
    this.tabName = tabName;
  }

  get gotoProfilePage() {
    return this.tabName;
  }

  set gotoSettingsPage(tabName) {
    this.tabName = tabName;
  }

  get gotoSettingsPage() {
    return this.tabName;
  }
}
