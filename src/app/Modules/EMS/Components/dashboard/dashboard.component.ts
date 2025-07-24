import { Component ,OnInit, ViewChild} from '@angular/core';
import { Chart, ChartData, ChartOptions, ChartType, registerables, ChartEvent, ActiveElement} from 'chart.js';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { DashboardService } from '../../Services/dashboard.service';
import { CommonModule } from '@angular/common';                  // ✅ NgIf and more
import { NgChartsModule } from 'ng2-charts'; 
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { DaterangepickerDirective } from "ngx-daterangepicker-material";
import { Router } from '@angular/router';
import moment from 'moment';

Chart.register(...registerables, ChartDataLabels);


@Component({
  selector: 'app-dashboard',
  imports: [NgChartsModule,CommonModule,FormsModule, ReactiveFormsModule, NgxDaterangepickerMd],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  filterForm!: FormGroup;
isApplyFilter = false;   
empId: number = 0;
UnitId:number=1;
  isDrilledDown = false;
   summary: any = {};
   objectKeys = Object.keys;
dashboardTasks: any;
  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };
scenarioChartData: ChartData<'bar'> = {
  labels: [],
  datasets: []
};

scenarioChartOptions: ChartOptions<'bar'> = {};
  baseChartOptions: ChartOptions<'bar'> = this.getChartOptions('Area', 'Count');

  private areaIds: number[] = [];
  private currentLevel: 'area' | 'section' = 'area';
   @ViewChild('picker') pickerDirective!: DaterangepickerDirective;

  constructor(private fb: FormBuilder,private dashboardService: DashboardService,private router: Router) {}

  ngOnInit(): void {
     const empIdString = sessionStorage.getItem('employeeId');
    this.empId = empIdString ? parseInt(empIdString, 10) : 0;
    this.initForm();
     this.getPendingTask();
    this.loadFireDrillSummary();
    this.loadAreaChart();
    this.loadScenarioChart();
  }
   initForm() {
      //  const today =  moment();
      const today = moment();
        const oneMonthAgo = moment().subtract(1, 'months'); 
          const fifteenDaysAgo = moment().subtract(15, 'days'); // 15 days before today
      this.filterForm = this.fb.group({
        selected: [{
          startDate: oneMonthAgo,
          endDate: today
        }]
       
      });
    }
    openfilter(): void {
      this.isApplyFilter = !this.isApplyFilter;
    }
     openDatepicker(): void {
    this.pickerDirective.open();
  }

  getPendingTask()
  {
    this.dashboardService.getDashboardTasks(this.empId).subscribe(
    (data) => {
      this.dashboardTasks = data;
    },
    (error) => {
      console.error('Failed to fetch dashboard tasks', error);
    }
  );
  }
  isDashboardTasksEmpty(): boolean {
  if (!this.dashboardTasks) return true;
  return Object.keys(this.dashboardTasks).every(key => this.dashboardTasks[key].length === 0);
}
 getDateRangeParams(): HttpParams {
  let params = new HttpParams();
  const dateRange = this.filterForm?.value?.selected;

  if (dateRange?.startDate && dateRange?.endDate) {
    const fromDate = dateRange.startDate.format('YYYY-MM-DD');
    const toDate = dateRange.endDate.format('YYYY-MM-DD');

    params = params.set('fromDate', fromDate).set('toDate', toDate);
  }

  if (this.UnitId) {
    params = params.set('unitId', this.UnitId.toString());
  }

  
  return params;
}
  onSearch(): void {
  if (this.filterForm.valid) {
    this.loadFireDrillSummary();
    this.loadAreaChart();
    this.loadScenarioChart();
  }
}
  loadFireDrillSummary()
  { 
    const params = this.getDateRangeParams();
   
    this.dashboardService.getSummary(params).subscribe(data => {
      this.summary = data;
    });

  }

  // 🔁 Reusable chart options generator
 getChartOptions(xLabel: string, yLabel: string, maxValue?: number): ChartOptions<'bar'> {
  const stepSize = 2;

  // Round up maxValue to next step
  const suggestedMax =
    maxValue !== undefined
      ? Math.ceil((maxValue + stepSize) / stepSize) * stepSize
      : undefined;
  return {
    responsive: true,
     onHover: (event, chartElement) => {
      const target = event?.native?.target as HTMLElement;
      if (chartElement?.length) {
        target.style.cursor = 'pointer';
      } else {
        target.style.cursor = 'default';
      }
    },
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: '#000',
        font: {
          weight: 'bold',
          size: 13
        },
        clip: false,
        formatter: (value: number) => {
          if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
          if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
          return value;
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Count: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {title: {display: true, text: xLabel,color: '#333',
                  font: {weight: 'bold',size: 16}},
          ticks: {color: '#333'}
         },
      y: {beginAtZero: true,suggestedMax: suggestedMax,title: 
                 {display: true,text: yLabel,color: '#333',
                 font: {weight: 'bold', size: 16}},
          ticks: {stepSize: stepSize, color: '#333',
          callback: function (value: any) {
            if (value >= 1000000) return value / 1000000 + 'M';
            if (value >= 1000) return value / 1000 + 'K';
            return value;
          }
        }
      }
    }
  };
}

  // 📊 Generic chart loader
  loadChart(
    labels: string[],
    data: number[],
    label: string,
    color: string
  ):
   void 
  {
    this.chartData = {labels,datasets: [{data,label,backgroundColor: color }]};
  }

  // 🔹 Initial chart
  loadAreaChart(): void {
    const params = this.getDateRangeParams();

    this.dashboardService.getDrillsByArea(params).subscribe(data => {
      const labels = data.map(item => item.areaName);
      const counts = data.map(item => item.count);
      this.areaIds = data.map(item => item.areaId);

      const maxValue = Math.max(...counts);
      this.baseChartOptions = this.getChartOptions('Area', 'Count', maxValue);

    //  this.baseChartOptions = this.getChartOptions('Area', 'Count');
      this.loadChart(labels, counts, 'Fire Drills by Area', '#D6D61E');
      this.isDrilledDown = false;
      this.currentLevel = 'area';
    });
  }

  // 🔸 On click → drill down
  onChartClick(event: { event?: ChartEvent; active?: any[] }): void {
    const index = event.active?.[0]?.index;
    if (index !== undefined && this.currentLevel === 'area') {
      const selectedAreaId = this.areaIds[index];
      const selectedAreaName = this.chartData.labels?.[index] as string;
      this.loadSectionChart(selectedAreaId, selectedAreaName);
    }
  }

  // 🔻 Drill-down chart
  loadSectionChart(areaId: number, areaName: string): void {
      const dateRange = this.filterForm?.value?.selected;

  if (!dateRange?.startDate || !dateRange?.endDate) {
    return; // or show validation error
  }

  const payload = {
    areaId,
    fromDate: dateRange.startDate.format('YYYY-MM-DD'),
    toDate: dateRange.endDate.format('YYYY-MM-DD'),
    unitId:this.UnitId.toString()
  };
  console.log("payload",payload)  
    this.dashboardService.getDrillsBySection(payload).subscribe(data => {
      const labels = data.map(item => item.sectionName);
      const counts = data.map(item => item.count);
        const maxValue = Math.max(...counts);
      this.baseChartOptions = this.getChartOptions('Section', 'Count', maxValue);

      //this.baseChartOptions = this.getChartOptions('Section', 'Count');
      this.loadChart(labels, counts, `Sections in ${areaName}`, '#90EE90');
      this.isDrilledDown = true;
      this.currentLevel = 'section';
    });
  }
  loadScenarioChart(): void {
    const params = this.getDateRangeParams();
  this.dashboardService.getDrillsByScenario(params).subscribe(data => {
    const labels = data.map(item => item.scenarioName);  // adjust property name if different
    const counts = data.map(item => item.count);

    const max = Math.max(...counts);
    this.scenarioChartOptions = this.getChartOptions('Scenario', 'Count', max);

    this.scenarioChartData = {
      labels,
      datasets: [
        {
          data: counts,
          label: 'Drills by Scenario',
          backgroundColor: '#FFB347'
        }
      ]
    };
  });
}
  goBack(): void {
    this.loadAreaChart();
  }

  mitigate(item: any) { 

  if (item?.url) {
    window.open(item.url, '_blank'); // open in new tab
  } else {
    this.router.navigate(['/action_plan'], {
      state: { drill: item ,  prepage: 'dashboard'}
    });
  }
}
}

