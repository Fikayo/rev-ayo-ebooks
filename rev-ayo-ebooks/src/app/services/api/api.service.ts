import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const API = "https://ebooksserver-jnueslq6ba-ez.a.run.app"

@Injectable({
  providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) { 
    }

    public async get(path: string): Promise<any> {
        path = path[0] == '/' ? path.slice(1) : path;
        await this.http.get(`${API}/${path}`).toPromise()
        .then((res: any) => {
            if (res.status > 299 || res.status < 200)
                return Promise.reject(res.data);

            return res.data;
        })
        .catch(error => {
            console.error(`Error during GET request to '${path}': ${error}`);
            return Promise.reject(error);
        });
    }

    public async post(path: string, body: any): Promise<any> {
        path = path[0] == '/' ? path.slice(1) : path;
        await this.http.post(`${API}/${path}`, body).toPromise()
        .then((res: any) => {
            if (res.status > 299 || res.status < 200)
                return Promise.reject(res.data);

            return res.data;
        })
        .catch(error => {
            console.error(`Error during POST request to '${path}': ${error}`);
            return Promise.reject(error);
        });
    }

    public async delete(path: string, options?: any): Promise<any> {
        path = path[0] == '/' ? path.slice(1) : path;
        await this.http.delete(`${API}/${path}`, options).toPromise()
        .then((res: any) => {
            if (res.status > 299 || res.status < 200)
                return Promise.reject(res.data);

            return res.data;
        })
        .catch(error => {
            console.error(`Error during DELETE request to '${path}': ${error}`);
            return Promise.reject(error);
        });
    }
}
