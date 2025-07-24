import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders,HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../Environment/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}
  

  getSummary(params: HttpParams) {
  
    return this.http.get<any[]>(`${this.baseUrl}/Dashboard/GetSummary`, { params });  
  }
  getDrillsByArea(params: HttpParams){
  return this.http.get<any[]>(`${this.baseUrl}/Dashboard/area-summary`,{ params });
}

getDrillsBySection(payload: { areaId: number; fromDate: string; toDate: string;unitId:string }){
   const params = new HttpParams()
    .set('areaId', payload.areaId)
    .set('fromDate', payload.fromDate)
    .set('toDate', payload.toDate)
     .set('UnitId', payload.unitId);
    console.log("sectionparamas",params)
  return this.http.get<any[]>(`${this.baseUrl}/Dashboard/section-summary`,{params});
}
getDrillsByScenario(params: HttpParams) {
  return this.http.get<any[]>(`${this.baseUrl}/Dashboard/getDrillsByScenario`,{ params });
}
getDashboardTasks(userId: number): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/Dashboard/firedrill-dashboard/${userId}`);
}

}
