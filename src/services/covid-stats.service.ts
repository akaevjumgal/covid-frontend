import {ActiveCaseModel, ActiveCaseStatus, CountryModel, Period, TotalByDay} from '../models/covid-stats.model'

class CovidStatsService {
  private readonly path = 'https://api.covid19api.com'

  async countries(): Promise<CountryModel[]> {
    const response = await fetch(`${this.path}/countries`, {
      method: 'get'
    })
    return await response.json()
  }

  async activeCases(country: string, period: Period): Promise<ActiveCaseModel[]> {
    const response = await fetch(
      `${this.path}/country/${country}?from=${period.from}&to=${period.to}`,
      {
        method: 'get'
      }
    )
    return await response.json()
  }

  async totalByCountryAndStatus(country: string, status: ActiveCaseStatus): Promise<TotalByDay[]> {
    const response = await fetch(`${this.path}/total/dayone/country/${country}/status/${status}`)
    return await response.json()
  }
}

export default new CovidStatsService()
