
export interface YearlyData {
  year: number;
  householdsProvidedEmployment: number;
  personDaysGenerated: number; // in lakhs
  averageDaysOfEmployment: number;
  totalExpenditure: number; // in crores
}

export interface DistrictData {
  name: string;
  data: YearlyData[];
}

export interface StateAverageData {
    year: number;
    householdsProvidedEmployment: number;
    personDaysGenerated: number;
    averageDaysOfEmployment: number;
    totalExpenditure: number;
}

export interface PerformanceData {
    district: DistrictData;
    stateAverage: StateAverageData[];
}
