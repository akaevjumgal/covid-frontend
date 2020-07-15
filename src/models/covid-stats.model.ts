
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

export interface Period {
  from: string
  to: string
}
