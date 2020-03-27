import React from 'react'
import classNames from 'classnames'
import numeral from 'numeral'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbtack, faPlusSquare, faMinusSquare } from '@fortawesome/free-solid-svg-icons'

import DeathsChart from './DeathsChart'
import OutbreakTable from './OutbreakTable'
import { Trans, useTranslation } from 'react-i18next';
import Information from '../ui/Information'
import { TableViewContext } from '../TableView'
import { AccelerationWithStyles } from '../ui/NumbersWithStyles'

export const DEATHS_SCALE = 10
export const CASES_SCALE = 100

const OneTableEntry = ({
  entry, index, dates, allDates,
  comparisonEntry,
  pinned, expanded, sideBySide,
  pinEntry, unpinEntry, expandEntry, collapseEntry, isMobile
}) => {
  const { setEntryHeight } = React.useContext(TableViewContext)
  const entryRef = React.useRef()
  React.useEffect(() => {
    setEntryHeight(entry.code, index, entryRef.current.getBoundingClientRect().height)
  })

  const { t, i18n } = useTranslation();

  const { scale, maxScaledValue, columns } = calculateScale (entry, dates, { sideBySide, deathsScale: DEATHS_SCALE, casesScale: CASES_SCALE })

  let comparisonOffset = 0

  if (comparisonEntry) {
    if (comparisonEntry.code === entry.code) {
      comparisonEntry = undefined
    } else if (entry.keyDates.death5 && comparisonEntry.keyDates.death5) {
      comparisonOffset = Math.ceil((entry.keyDates.death5.getTime() - comparisonEntry.keyDates.death5.getTime()) / (1000*60*60*24))
    }
  }

  return (
    <div key={entry.code} ref={entryRef} className={classNames('TableView-row', { pinned, expanded })}>
      <DeathsChart
        entry={entry} dates={dates}
        comparisonEntry={comparisonEntry} comparisonOffset={comparisonOffset}
        sideBySide={sideBySide}
        scale={scale} casesScale={CASES_SCALE} maxScaledValue={maxScaledValue} columns={columns}
      />

      <div className='TableView-title'>
        <div className='tools'>
          {pinEntry && (
            pinned
            ? <button className='segment activated' onClick={ () => unpinEntry(entry) }>
                <FontAwesomeIcon icon={faThumbtack} style={{verticalAlign: 'text-bottom'}} />&nbsp;
                {t('entry.unpin_button', 'pinned to top')}
              </button>
            : <button className='segment' onClick={ () => pinEntry(entry) }>
                <FontAwesomeIcon icon={faThumbtack} style={{verticalAlign: 'text-bottom'}} />&nbsp;
                {t('entry.pin_button', 'pinned')}
              </button>
          )}
          { expandEntry && (
            expanded
            ? <button className='segment activated' onClick={ () => collapseEntry(entry) }>
                <FontAwesomeIcon icon={faMinusSquare} style={{verticalAlign: 'text-bottom'}} />&nbsp;
                {t('entry.collapse_button', 'hide data')}
              </button>
            : <button className='segment' onClick={ () => expandEntry(entry) }>
                <FontAwesomeIcon icon={faPlusSquare} style={{verticalAlign: 'text-bottom'}} />&nbsp;
                {t('entry.expand_button', 'show more')}
              </button>
          )}
        </div>

        <div className='title'>
          <span className='flag'>{entry.emoji}</span>
          <span className='name'>
            {entry[`${i18n.language}Name`] || entry.name || entry.code}
          </span>
          <span className='info'>
            {entry.latestOutbreakDay.deaths &&
                <span className='outbreakDay'>
                  &nbsp;•&nbsp;
                  <Trans i18nKey='entry.outbreak_day'>
                  day {{ day: entry.latestOutbreakDay.deaths }}
                  </Trans>
                  <Information content='numbers' />
                </span>
              }
          </span>
        </div>

        <div className='totals'>
          <div className='deaths'>
            {entry.latestTotal.deaths > 0 && entry.latestDaily.deaths > 0 &&
              <Trans i18nKey='entry.deaths_total_with_latest'>
                {{total: numeral(entry.latestTotal.deaths).format('0,000')}} deaths (+{{latest: numeral(entry.latestDaily.deaths).format('0,000')}})
              </Trans>
            }
            {entry.latestTotal.deaths > 0 && !entry.latestDaily.deaths &&
              <Trans i18nKey='entry.deaths_total_with_no_change'>
                {{total: numeral(entry.latestTotal.deaths).format('0,000')}} deaths
              </Trans>
            }
            {!entry.latestTotal.deaths &&
              <Trans i18nKey='entry.deaths_total_no_deaths'>
                no deaths
              </Trans>
            }
          </div>

          {false && entry.latestAcceleration.deaths &&
            <div className='velocitySummary acceleration'>
              <AccelerationWithStyles value={1 / entry.latestAcceleration.deaths} arrows={false} colors={false} format={'0,000.0'} /> days to 10x
              <Information content='numbers' />
            </div>
          }

          {/* {entry.latestVelocity.deaths && entry.latestVelocity.deaths !== 1 &&
            <div className='velocitySummary velocity'>
              <Trans i18nKey='entry.velocity_description'>
                Growing <VelocityWithStyles value={entry.latestVelocity.deaths} />/week
              </Trans>
              {entry.latestAcceleration.deaths &&
                <span>&nbsp;&nbsp;<AccelerationWithStyles value={entry.latestAcceleration.deaths} /></span>
              }
            </div>
          } */}

          <div className='cases'>
            {entry.latestTotal.cases > 0 && entry.latestDaily.cases > 0 &&
              <Trans i18nKey='entry.cases_total_with_latest'>
                {{total: numeral(entry.latestTotal.cases).format('0,000')}} cases (+{{latest: numeral(entry.latestDaily.cases).format('0,000')}})
              </Trans>
            }
            {entry.latestTotal.cases > 0 && !entry.latestDaily.cases &&
              <Trans i18nKey='entry.cases_total_with_no_change'>
                {{total: numeral(entry.latestTotal.cases).format('0,000')}} cases
              </Trans>
            }
            {!entry.latestTotal.cases &&
              <Trans i18nKey='entry.cases_total_no_cases'>
                no cases
              </Trans>
            }
          </div>

        </div>
      </div>

      {expanded && (
        <div className='TableView-more'>
          {entry && (entry.links || entry.population) &&
            <section>
              {entry.links && (
                <>
                  <b><Trans i18nKey='entry.links_label'>Links:</Trans>&nbsp;&nbsp;</b>
                  {Object.keys(entry.links).map(key =>
                    <span key={key}><a href={entry.links[key]} target='_blank' rel="noopener noreferrer">{key}</a>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  )}
                </>
              )}
              {entry.links && entry.population && <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>}
              {entry.population && (
                <>
                  <b>
                    <Trans i18nKey='entry.population_label'>Population:</Trans>&nbsp;
                  </b>
                  {numeral(entry.population).format('0,000')}M
                </>
              )}
            </section>
          }

          <section>
            <OutbreakTable entry={entry} dates={allDates} />
          </section>

          {entry && entry.sources && entry.sources.deaths && (
            <section>
              <b><Trans i18nKey='entry.includes_data_for'>Includes data labeled as</Trans></b>
              &nbsp;&nbsp;
              {entry.sources.deaths.map(name =>
                <span key={name}>{name}&nbsp;&nbsp;&nbsp;&nbsp;</span>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function calculateScale (entry, dates, { sideBySide, deathsScale = DEATHS_SCALE, casesScale = CASES_SCALE }) {
  let scale = 1
  let maxDeaths = Math.max(...dates.map(d => (entry.daily.deaths && entry.daily.deaths[d]) || 0), 0)
  let maxCases = Math.max(...dates.map(d => (entry.daily.cases && entry.daily.cases[d]) || 0), 0) / casesScale

  if (maxDeaths >= 100 && sideBySide) {
    scale = deathsScale
    maxDeaths = maxDeaths / scale
    maxCases = maxCases / scale
  }

  let maxScaledValue = Math.max(maxDeaths, maxCases)

  let columns = 1

  if (sideBySide) {
    if (maxScaledValue > 600) columns = 6
    else if (maxScaledValue >= 200) columns = 4
    else if (maxScaledValue >= 150) columns = 3
    else if (maxScaledValue >= 100) columns = 3
    else if (maxScaledValue >= 50) columns = 2
  }

  return { scale, maxScaledValue, columns }
}

export default OneTableEntry
