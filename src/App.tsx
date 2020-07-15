import React, {ChangeEvent} from 'react'
import './App.scss'
import {ActiveCaseModel, CountryModel, Period} from './models/covid-stats.model'
import CovidStatsService from './services/covid-stats.service'
import {action, observable, runInAction} from 'mobx'
import {observer} from 'mobx-react'
import moment from 'moment'

const DEFAULT_SLUG = 'kyrgyzstan'
const DATE_FORMAT = 'DD MMMM'
const REQUEST_DATE_FORMAT = 'YYYY-MM-DDT[00:00:00Z]'
const STORAGE_KEY = 'country'

@observer
class App extends React.Component {

  @observable
  private countries: CountryModel[] = []

  @observable
  private selectedCountry: string = ''

  @observable
  private casesByCountry: ActiveCaseModel[] = []

  @observable
  private loading: boolean = false

  @observable
  private isFetchingStats: boolean = false

  async componentDidMount() {
    await this.fetchCountries()
    const defaultCountry = this.countries.find(c => c.Slug === DEFAULT_SLUG)

    if (defaultCountry) {
      this.selectedCountry = window.localStorage.getItem(STORAGE_KEY) || defaultCountry.Slug
      this.fetchStatsByCountry(this.selectedCountry)
    }
  }

  setDocumentTitle = (country: string) => {
    document.title = `Stats for ${country}`
  }

  async fetchCountries() {
    runInAction(() => {
      this.loading = true
    })
    this.countries = await CovidStatsService.countries()
    runInAction(() => {
      this.loading = false
    })
  }

  fetchStatsByCountry = async (country: string) => {
    runInAction(() => {
      this.isFetchingStats = true
    })
    const period: Period = {
      from: moment().utc().subtract(5, 'day').format(REQUEST_DATE_FORMAT),
      to: moment().utc().format(REQUEST_DATE_FORMAT)
    }
    this.casesByCountry = await CovidStatsService.activeCases(country, period)
    this.setDocumentTitle(this.selectedCountry)
    window.localStorage.setItem(STORAGE_KEY, this.selectedCountry)
    runInAction(() => {
      this.isFetchingStats = false
    })
  }

  get mostRecoveredCase(): { count: number, date: string } {
    const cases = this.aggregated

    if (!cases.length) {
      return {
        count: 0,
        date: ''
      }
    }

    const count = Math.max(...cases.map(t => t.Recovered))
    const foundedCase = cases.find(t => t.Recovered === count)

    return {
      count,
      date: foundedCase ? moment(foundedCase.Date).format(DATE_FORMAT) : ''
    }
  }

  get aggregated(): ActiveCaseModel[] {
    return this.casesByCountry.slice().reverse().reduce((prev: ActiveCaseModel[], next, index, array) => {
      let New: number = 0
      if (array[index + 1]) {
        New = Math.abs(array[index].Confirmed - array[index + 1].Confirmed)
      }
      prev.push({
        ...next, New: New
      })
      return prev;
    }, [])
  }

  render() {

    if (this.loading) {
      return (
        <div className='overlay'><div className='loader'>Loading...</div></div>
      )
    }

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
            {this.aggregated.map((activeCase, index) => (
              <div key={index} className='App__active_case'>
                <div>
                  <p className='date'>{moment(activeCase.Date).format(DATE_FORMAT)}</p>
                </div>
                <div>
                  <div className='block'>
                    <p className='section'>New<span>{activeCase.New}</span></p>
                    <p className='section'>Active<span>{activeCase.Active}</span></p>
                    <p className='section'>Deaths<span>{activeCase.Deaths}</span></p>
                  </div>
                  <div className='block'>
                    <p className='section'>Confirmed<span>{activeCase.Confirmed}</span></p>
                    <p className='section'>Recovered<span>{activeCase.Recovered}</span></p>
                  </div>
                </div>
              </div>
            ))}
            {this.isFetchingStats && (
              <div className='loader'>Loading...</div>
            )}
            {!this.casesByCountry.length && (
              <h3 className='no_data'>
                No cases! Hooray!
              </h3>
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
  onSelectCountry = (event: ChangeEvent<HTMLSelectElement>) => {
    event.persist()
    this.selectedCountry = event.target.value
    this.fetchStatsByCountry(this.selectedCountry)
  }
}

export default App;
