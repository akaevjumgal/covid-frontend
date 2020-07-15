
export class CountryModel {
  Country: string
  Slug: string
  ISO2: string
}

export class ActiveCaseModel {
  Cases: number
  City: string
  CityCode: string
  Country: string
  CountryCode: string
  Date: string
  Lat: string
  Lon: string
  Province: string
  Status: string
}

export interface Period {
  from: string
  to: string
}
