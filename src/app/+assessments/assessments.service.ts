
import { Injectable }    from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class AssessmentsService {
    public url = '';  // URL to web api
    private headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http) { }

    public load(filter?: any): Observable<any[]> {
        const url = filter ? `${this.url}` + '?' + encodeURI(filter) : `${this.url}`;
        return this.http
               .get(url)
               .map((response) => {
                   return response.json().data as any[];
                })
                .catch(this.handleError);
    }

    private handleError(error: Response | any): Observable<any> {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}