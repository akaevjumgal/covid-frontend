import React, {ChangeEvent} from 'react'
import './App.scss';
import {ActiveCaseModel, CountryModel, Period} from './models/covid-stats.model'
import CovidStatsService from './services/covid-stats.service'
import {action, observable, runInAction} from 'mobx'
import {observer} from 'mobx-react'
import moment from 'moment'

const DEFAULT_SLUG = 'kyrgyzstan'

@observer
class App extends React.Component {

  @observable
  private countries: CountryModel[] = []

  @observable
  private selectedCountry: string = ''

  @observable
  private casesByCountry: ActiveCaseModel[] = []

  componentDidMount() {
    runInAction(async () => {
      this.countries = await CovidStatsService.countries()
      const defaultCountry = this.countries.find(c => c.Slug === DEFAULT_SLUG)

      if (defaultCountry) {
        this.selectedCountry = defaultCountry.Slug
        this.fetchStatsByCountry(this.selectedCountry)
      }
    })
  }

  fetchStatsByCountry = async (country: string) => {
    const period: Period = {
      from: moment().utc().clone().subtract(5, 'day').format('YYYY-MM-DDT[00:00:00Z]'),
      to: moment().utc().clone().format('YYYY-MM-DDT[00:00:00Z]')
    }
    this.casesByCountry = await CovidStatsService.statsByCountry(country, period)
  }

  render() {
    console.log(Array.from(this.casesByCountry))
    return (
      <div className="App">
        <select className='App__select_country' value={this.selectedCountry} onChange={this.onSelectCountry}>
          {this.countries.map(s => (
            <option value={s.Slug} key={s.Country}>
              {s.Country}
            </option>
          ))}
        </select>

        <div className='App__content'>
          {this.casesByCountry.reverse().map(activeCase => (
            <div key={activeCase.Date} className='App__active_case'>
              <div>
                <p>{moment(activeCase.Date).format('DD MMMM')}</p>
              </div>
              <div>
                <p className='section'><b>Confirmed</b>{activeCase.Cases}</p>
              </div>
            </div>
          ))}
          {!this.casesByCountry.length && (
            <div>
              NO DATA FOR {this.selectedCountry.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  }

  @action
  onSelectCountry = async (event: ChangeEvent<HTMLSelectElement>) => {
    event.persist()
    this.selectedCountry = event.target.value
    this.fetchStatsByCountry(this.selectedCountry)
  }
}

export default App;
