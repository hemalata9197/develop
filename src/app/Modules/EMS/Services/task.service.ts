import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../Environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getAllTask(params: HttpParams) {
    return this.http.get<{ data: any[]; totalCount: number }>(`${this.baseUrl}/Task/getTask`, { params });
  }
  getTaskstatus(taskstatusFor:string) {
    return this.http.get<any[]>(`${this.baseUrl}/Task/getTaskstatus/${taskstatusFor}`);
     
  }
  
  UpdateTaskSatus(obj: any) {

    console.log("ForDocuments",obj)
  return this.http.put(`${this.baseUrl}/Task/UpdateTaskSatus`, obj);
}
getApprovalstatus() {
    return this.http.get<any[]>(`${this.baseUrl}/Task/getApprovalstatus`);
  }
  UpdateTaskApproval(obj: any) {
  return this.http.put(`${this.baseUrl}/Task/UpdateTaskApproval`, obj);
}
getFacility(Source:string) {
    return this.http.get<any[]>(`${this.baseUrl}/submitreport/getFacility/${Source}`);
     
  }
  getTaskHistory(TaskId:number)
  { 
    return this.http.get< any[]>(`${this.baseUrl}/Task/getTaskHistory/${TaskId}`);    
  }
// GetTaskById(TaskId: number): Observable<any> {
//   return this.http.get(`${this.baseUrl}/Task/GetTaskById/${TaskId}`);
// }
}
