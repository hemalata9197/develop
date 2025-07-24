import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders,HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../Environment/environment';

@Injectable({
  providedIn: 'root'
})
export class FireDrillService { private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

   getFormFields(): Observable<any[]> {
  
    return this.http.get<any[]>(`${this.baseUrl}/SubmitReport/fire-drill-form`);
  }

  submitForm(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/submitreport/submit`, data, {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    responseType: 'json'
  });  
}

updateForm(data: any,fireDrillId:number): Observable<any> {
  return this.http.post(`${this.baseUrl}/submitreport/update/${fireDrillId}`, data, {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    responseType: 'json'
  });  
}

getFireDrillById(id: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/submitreport/fire-drill/${id}`, {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  });
}

getFireDrills(params: HttpParams) {

     return this.http.get<{ data: any[]; totalCount: number }>(`${this.baseUrl}/submitreport/fire-drills`, { params });
  }
  DeleteFireDrill(id: number,empId:number): Observable<any> {
     const params = new HttpParams()
    .set('id', id.toString())
    .set('empId', empId.toString());
    return this.http.delete(`${this.baseUrl}/submitreport/DeleteFireDrill`, { params });
  }

  getSectionsWithFields() {
    return this.http.get<any[]>(`${this.baseUrl}/submitreport/fire-drill-form`);
  }

  addSection(section: any) {
    return this.http.post<number>(`${this.baseUrl}/submitreport/add-section`, section);
  }

  addField(field: any) {
    return this.http.post<number>(`${this.baseUrl}/submitreport/add-field`, field);
  }

  deleteField(id: number) {
    return this.http.delete(`${this.baseUrl}/submitreport/delete-field/${id}`);
  }

  deleteSection(id: number) {
    return this.http.delete(`${this.baseUrl}/submitreport/delete-section/${id}`);
  }
}
