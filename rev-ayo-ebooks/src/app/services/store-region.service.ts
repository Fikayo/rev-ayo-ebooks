import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { StoreRegion } from '../models/Region';

@Injectable({
  providedIn: 'root'
})
export class StoreRegionService {

    private storeRegion: StoreRegion = StoreRegion.UNKNOWN;
    private regionSource = new BehaviorSubject<StoreRegion>(StoreRegion.UNKNOWN);    

    constructor() {}

    public region(): Observable<StoreRegion> {
        return this.regionSource.asObservable();
    }

    public updateStoreRegion(region: StoreRegion) {
        if (region != this.storeRegion) {
            this.storeRegion = region;
            this.regionSource.next(region);
        }
    }
}
