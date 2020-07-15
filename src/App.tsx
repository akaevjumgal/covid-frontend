import React, {ChangeEvent} from 'react'
import './App.scss'
import {ActiveCaseModel, ActiveCaseStatus, CountryModel, Period, TotalByDay} from './models/covid-stats.model'
import CovidStatsService from './services/covid-stats.service'
import {action, observable, runInAction} from 'mobx'
import {observer} from 'mobx-react'
import moment from 'moment'

const DEFAULT_SLUG = 'kyrgyzstan'
const DATE_FORMAT = 'DD MMMM'

@observer
class App extends React.Component {

  @observable
  private countries: CountryModel[] = []

  @observable
  private selectedCountry: string = ''

  @observable
  private casesByCountry: ActiveCaseModel[] = []

  @observable
  private totalByDay: TotalByDay[] = []

  componentDidMount() {
    runInAction(async () => {
      this.countries = await CovidStatsService.countries()
      const defaultCountry = this.countries.find(c => c.Slug === DEFAULT_SLUG)

      if (defaultCountry) {
        this.selectedCountry = defaultCountry.Slug
        this.fetchStatsByCountry(this.selectedCountry)
        this.fetchTotalByCountryAndStatus(this.selectedCountry, ActiveCaseStatus.recovered)
      }
    })
  }

  fetchStatsByCountry = async (country: string) => {
    const period: Period = {
      from: moment().clone().subtract(5, 'day').format('YYYY-MM-DDT[00:00:00Z]'),
      to: moment().clone().format('YYYY-MM-DDT[00:00:00Z]')
    }
    this.casesByCountry = await CovidStatsService.activeCases(country, period)
  }

  fetchTotalByCountryAndStatus = async (country: string, status: ActiveCaseStatus) => {
    this.totalByDay = await CovidStatsService.totalByCountryAndStatus(country, status)
  }

  get mostRecoveredCase(): { count: number, date: string } {

    if (!this.totalByDay.length) {
      return {
        count: 0,
        date: ''
      }
    }

    const count = Math.max(...this.totalByDay.map(t => t.Cases))
    const foundedCase = this.totalByDay.find(t => t.Cases === count)

    return {
      count,
      date: foundedCase ? moment(foundedCase.Date).format(DATE_FORMAT) : ''
    }
  }

  render() {

    return (
      <div className="App">
        <select className='App__select_country' value={this.selectedCountry} onChange={this.onSelectCountry}>
          {this.countries.map(s => (
            <option value={s.Slug} key={s.Country}>
              {s.Country}
            </option>
          ))}
        </select>

        <div className='App__main'>
          <div className='App__content'>
            {this.casesByCountry.slice().reverse().map(activeCase => (
              <div key={activeCase.Date} className='App__active_case'>
                <div>
                  <p className='date'>{moment(activeCase.Date).format(DATE_FORMAT)}</p>
                </div>
                <div>
                  <div className='block'>
                    <p className='section'><b>Active</b><span>{activeCase.Active}</span></p>
                    <p className='section'><b>Deaths</b><span>{activeCase.Deaths}</span></p>
                  </div>
                  <div className='block'>
                    <p className='section'><b>Confirmed</b><span>{activeCase.Confirmed}</span></p>
                    <p className='section'><b>Recovered</b><span>{activeCase.Recovered}</span></p>
                  </div>
                </div>
              </div>
            ))}
            {!this.casesByCountry.length && (
              <div>
                NO DATA FOR {this.selectedCountry.toUpperCase()}
              </div>
            )}
          </div>
          <div className='total'>
            <p className='title'>Top recovered cases</p>
            <h1 className='count'>{this.mostRecoveredCase.count}</h1>
            <hr/>
            <h1>{this.mostRecoveredCase.date}</h1>
          </div>
        </div>
      </div>
    );
  }

  @action
  onSelectCountry = async (event: ChangeEvent<HTMLSelectElement>) => {
    event.persist()
    this.selectedCountry = event.target.value
    this.fetchStatsByCountry(this.selectedCountry)
    this.fetchTotalByCountryAndStatus(this.selectedCountry, ActiveCaseStatus.recovered)
  }
}

export default App;
