import { Injectable } from '@angular/core';
import { NativePageTransitions, NativeTransitionOptions } from '@awesome-cordova-plugins/native-page-transitions/ngx';
import { NavController } from '@ionic/angular';
import { NavigationOptions } from '@ionic/angular/providers/nav-controller';

const defaultOptions: NativeTransitionOptions = {
    direction: 'up',
    duration: 250,
    slowdownfactor: -1,
    slidePixels: 20,
    // iosdelay: 100,
    // androiddelay: 150,
    fixedPixelsTop: 0,
    fixedPixelsBottom: 60
}

@Injectable({
  providedIn: 'root'
})
export class TransitionService {

    constructor(private navCtrl: NavController, private transition: NativePageTransitions) { }

    public slide(path: string, options: NativeTransitionOptions | undefined = undefined) {
        const transOptions = this.getOptions(options);

        this.transition.slide(transOptions);
        this.navCtrl.navigateForward([path]);
    }

    public fade(path: string, options: NativeTransitionOptions | undefined = undefined) {
        const transOptions = this.getOptions(options);

        this.transition.fade(transOptions);
        this.navCtrl.navigateForward([path]);
    }

    
    public flip(path: string, options: NativeTransitionOptions | undefined = undefined, navOptions: NavigationOptions | undefined = undefined) {
        const transOptions = this.getOptions(options);

        this.transition.flip(transOptions);
        this.navCtrl.navigateForward([path], navOptions);
    }

    public curl(path: string, options: NativeTransitionOptions | undefined = undefined, navOptions: NavigationOptions | undefined = undefined) {
        const transOptions = this.getOptions(options);

        this.transition.curl(transOptions);
        this.navCtrl.navigateForward([path], navOptions);
    }

    private getOptions(options: NativeTransitionOptions | undefined): NativeTransitionOptions {
        const transOptions = defaultOptions as any;
        if (options) {
            const opts = options as any;
            const valid = Object.keys(options);
            valid.forEach(v => {
                transOptions[v] = opts[v];
            })
        }

        return transOptions as NativeTransitionOptions;
    }
}
