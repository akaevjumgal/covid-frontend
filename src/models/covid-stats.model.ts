
export class CountryModel {
  Country: string
  Slug: string
  ISO2: string
}

export class ActiveCaseModel {
  Active: number
  City: string
  CityCode: string
  Confirmed: number
  Country: string
  CountryCode: string
  Date: string
  Deaths: number
  Lat: string
  Lon: string
  Province: string
  Recovered: number
}

export enum ActiveCaseStatus {
  confirmed = 'confirmed',
  recovered = 'recovered',
  deaths = 'deaths'
}

export class TotalByDay {
  Cases: number
  City: string
  CityCode: string
  Country: string
  CountryCode: string
  Date: string
  Lat: string
  Lon: string
  Province: string
  Status: ActiveCaseStatus
}

export interface Period {
  from: string
  to: string
}
