import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders,HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../Environment/environment';


@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

   getFields(reportType: string,unitId: number ): Observable<any> {
    const params = new HttpParams()
    .set('reportType', reportType)
     .set('unitId', unitId.toString());
    return this.http.get<any>(`${this.baseUrl}/Reports/GetReportFields`, { params });
  }

  getData( params:HttpParams): Observable<any> {  

    return this.http.get<any>(`${this.baseUrl}/Reports/GetReportData`, { params });    
  }
}
