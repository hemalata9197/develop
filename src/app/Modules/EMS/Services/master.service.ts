import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders,HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../Environment/environment';

@Injectable({
  providedIn: 'root'
})
export class MasterService {
   private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}
  getAreas(source: string,unitId:number)
  {  
    return this.http.get<any[]>(`${this.baseUrl}/Master/GetDropdownOptions/${source}/${unitId}`);

  }
  getSections(source: string,unitId:number)
  { return this.http.get<any[]>(`${this.baseUrl}/Master/GetDropdownOptions/${source}/${unitId}`);

  }
 
  getScenarios(source: string, unitId: number) {
  return this.http.get<any[]>(`${this.baseUrl}/Master/GetDropdownOptions/${source}/${unitId}`);
}


 getDropdownOption(source: string, unitId: number) {
  return this.http.get<any[]>(`${this.baseUrl}/Master/GetDropdownOptions/${source}/${unitId}`);
}
 getAllMasterFields(
    source: string,
    unitId: number,
    params?: { page?: number; size?: number }
  ): Observable<any> {
    let queryParams = new HttpParams()
      .set('source', source)
      .set('unitId', unitId.toString())
      .set('page', params?.page?.toString() || '1')
      .set('size', params?.size?.toString() || '10');

    return this.http.get<any>(`${this.baseUrl}/Master/GetAllMasterFields`, {
      params: queryParams
    });
  }

create(source: string, data: any): Observable<any> {
  console.log("Provided Data:",data)
    return this.http.post(`${this.baseUrl}/Master/Create/${source}`, data);
  }

  // Update existing data
  update(source: string, id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/Master/Update/${source}/${id}`, data);
  }
  //  updateStatus(source: string, id: number, isActive :boolean): Observable<any> {
  //   return this.http.put(`${this.baseUrl}/Master/updateStatus/${source}/${id}`, isActive);
  // }
  updateStatus(data: { source: string; id: number; isActive: boolean }): Observable<any> {
  return this.http.put(`${this.baseUrl}/Master/updateStatus`, data);
}
  //create( endpoint: string,data: any): Observable<any> {
  //   console.log("data for submission",data)
  //   return this.http.post<any>(`${this.baseUrl}/Master/`, data);
  // }

  // update(endpoint: string, id: number, data: any): Observable<any> {
  //   return this.http.put<any>(`${endpoint}/${id}`, data);
  // }


  delete(endpoint: string, id: number): Observable<any> {
    return this.http.delete<any>(`${endpoint}/${id}`);
  }
   getMenus() {
    return this.http.get<any[]>(`${this.baseUrl}/Master/menus`);
  }
   getRoleMenuIds(roleId: number): Observable<number[]> {
  return this.http.get<number[]>(`${this.baseUrl}/Master/${roleId}/menu-ids`);
}
saveRoleMenuPermissions(data: { roleId: number; menuIds: number[] }) {
  return this.http.post(`${this.baseUrl}/Master/SaveRoleMenuPermissions`, data);
}

  
}
