import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TokenInterceptor } from './Core/Auth/token-auth.interceptor';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgChartsModule } from 'ng2-charts';
//import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


export const appConfig: ApplicationConfig = {
  providers: [

    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // <-- Important fix
    provideClientHydration(withEventReplay()),
    importProvidersFrom(ReactiveFormsModule, NgxDaterangepickerMd.forRoot(),NgChartsModule,),//NgMultiSelectDropDownModule.forRoot()
  
    TokenInterceptor // <-- Provide class in DI   npm install chart.js ng2-chartss
  ]
};