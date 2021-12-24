import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JsonSQLite } from '@capacitor-community/sqlite';
import { Plugins } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
const {CapacitorSQLite, Device, Storage}  = Plugins;

const DB_SETUP_KEY = "first_db_setup";
const DB_NAME_KEY = "db_name";
const REMOTE_SCHEMA_JSON = "";

// https://www.youtube.com/watch?v=2kTT3k8ztL8 for reference

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
    private dbReady = new BehaviorSubject(false);
    private name = '';

    constructor(
        private http: HttpClient,
        private alertCtrl: AlertController) { }


    public get ready(): BehaviorSubject<boolean> {
        return this.dbReady;
    }

    public async init() {
        const info = await Device.getInfo();
        if(info.platform == 'android') {
            try {
                const sqlite = CapacitorSQLite as any;
                await sqlite.requestPermissions();
                this.setupDatabase();
            } catch (error) {
                const alert = await this.alertCtrl.create({
                    header: 'No DB access',
                    message: "This app can't work without Database access.",
                    buttons: ['Ok']
                });

                console.error("No db access", error);
                await alert.present();
            }
        } else {
            this.setupDatabase();
        }
    }

    private async setupDatabase() {
        const initiliased = await Storage.get({ key: DB_SETUP_KEY });

        if (!initiliased.value) {
            this.downloadDatabase();
        } else {
            this.name = (await Storage.get({ key: DB_NAME_KEY })).value;
            await CapacitorSQLite.open({ database: this.name });
            this.dbReady.next(true);
        }
    }

    private downloadDatabase(update = false) {
        this.http.get(REMOTE_SCHEMA_JSON)
        .subscribe({
            next: async (jsonExport: any) => {
                console.log(jsonExport);
                let json = jsonExport as JsonSQLite;
                console.log(json);
                const jsonstring = JSON.stringify(json);
                const isValid = await CapacitorSQLite.isJsonValid({jsonstring});

                if(isValid.result) {
                    this.name = json.database;
                    await Storage.set({key: DB_NAME_KEY, value: this.name});
                    await CapacitorSQLite.importFromJson({jsonstring});
                    await Storage.set({key: DB_SETUP_KEY, value: '1'});

                    // Detect any offline changes (may not be needed for my puposes though).
                    if(update) {
                        await CapacitorSQLite.setSyncDate({syncdate: '' + new Date().getTime()});
                    } else {
                        await CapacitorSQLite.createSyncTable();
                    }

                    // await CapacitorSQLite.open({ database: this.name });
                    this.dbReady.next(true);
                }
            },

            error: () => console.error("An error occured while downloading the database");
        });
    }
}
