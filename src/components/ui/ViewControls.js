import React from 'react'
import { connect } from 'react-redux'
import Popup from 'reactjs-popup'
import { Trans, useTranslation } from 'react-i18next';
import KeyboardEventHandler from 'react-keyboard-event-handler'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons'

import './ViewControls.css'

import { viewOptionsForSorting, SORTER_TYPES, SORTER_DESCRIPTIONS } from '../../store/sorters'
import { viewOptionsForFiltering, FILTER_TYPES, FILTER_DESCRIPTIONS } from '../../store/filters'

const ViewControls = ({
  setUI, resetUI,
  search, view, sort, filter, noScaling, weeks, totals,
  isMobile
}) => {
  const { t } = useTranslation();
  const searchRef = React.useRef()
  // React.useEffect(() => {
  //   setEntryHeight(entry.code, index, entryRef.current.getBoundingClientRect().height)
  // })

  let viewOptions = {}
  viewOptions = viewOptionsForSorting(sort, viewOptions)
  viewOptions = viewOptionsForFiltering(filter, viewOptions)

  const filterDescription = t(`filter.description.${viewOptions.filter}`, viewOptions.filterDescription)
  const sortDescription = t(`sort.description.${viewOptions.sort}`, viewOptions.sortDescription)


  const handleSearchClick = () => {
    setUI({search: ''})
    window.setTimeout(() => {searchRef.current && searchRef.current.focus()}, 1)
  }

  const handleFindKey = (key, event) => {
    if (key === 'ctrl+f' || key === 'meta+f') {
      setUI({search: ''})
      window.setTimeout(() => {searchRef.current && searchRef.current.focus()}, 1)
    } else if (key === 'esc') {
      setUI({search: undefined})
    }
    event.stopPropagation()
    event.preventDefault()
  }

  return (
    <div className='ViewControls'>
      <section>
        <Popup
          tooltip
          position={'bottom center'}
          arrow={false}
          closeOnDocumentClick
          className='ViewControls-popup'
          overlayStyle={{
            zIndex: 1000
          }}
          contentStyle={{
            zIndex: 1001,
            backgroundColor: 'inherit',
            color: 'inherit',
            border: 'none',
            minWidth: '27em'
          }}
          trigger={
            <span className='ViewControls-trigger'>
              <FontAwesomeIcon icon={faFilter} />&nbsp;
              <Trans i18nKey='view_description.view_description'>
                <b>{{filter: filterDescription}}</b> sorted by <b>{{sort: sortDescription}}</b>
              </Trans>
            </span>
          }
        >
        {close => (
          <div className='ViewControls-popup form'>
            <div className='form-row'>
              <div className='form-label'><Trans i18nKey='view_controls.show_label'>Show</Trans></div>
              <div className='form-field'>
                <select value={viewOptions.filter || ''} onChange={(event) => setUI({filter: event.target.value})}>
                  {FILTER_TYPES.map(option => (
                    <option key={option} value={option}>{t(`filter.description.${option}`, FILTER_DESCRIPTIONS[option])}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className='form-row'>
              <div className='form-label'><Trans i18nKey='view_controls.sort_label'>Show</Trans></div>
              <div className='form-field'>
                <select value={viewOptions.sort || ''} onChange={(event) => setUI({sort: event.target.value})}>
                  {SORTER_TYPES.map(option => (
                    <option key={option} value={option}>{t(`sort.description.${option}`, SORTER_DESCRIPTIONS[option])}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className='form-row'>
              <div className='form-label'><Trans i18nKey='view_controls.weeks_label'>Limit To</Trans></div>
              <div className='form-field'>
                <select value={weeks || ''} onChange={(event) => setUI({weeks: event.target.value})}>
                  <option value={''}>{t(`weeks.description.fit`, 'What fits on screen')}</option>
                  <option value={'four'}>{t(`weeks.description.four`, 'Last 4 weeks')}</option>
                  <option value={'six'}>{t(`weeks.description.six`, 'Last 6 weeks')}</option>
                  <option value={'eight'}>{t(`weeks.description.eight`, 'Last 8 weeks')}</option>
                  <option value={'all'}>{t(`weeks.description.all`, 'All available dates')}</option>
                </select>
              </div>
            </div>

            {/* <div className='form-row'>
              <div className='form-label'><Trans i18nKey='view_controls.view_label'>Style</Trans></div>
              <div className='form-field'>
                <select value={view || ''} onChange={(event) => setUI({view: event.target.value})}>
                <option value={undefined}>{t(`view.description.compact`, 'Compact')}</option>
                  <option value={'classic'}>{t(`view.description.classic`, 'Classic')}</option>
                </select>
              </div>
            </div> */}

            {/* <div className='form-row'>
              <div className='form-label'>
                <input
                  type='checkbox' id='totals' name='noScaling' checked={!!totals}
                  onChange={(event) => setUI({totals: event.target.checked})}
                />
              </div>
              <div className='form-field'>
                <label htmlFor='totals'><Trans i18nKey='view_controls.totals_label'>Show Totals</Trans></label>
              </div>
            </div> */}

            {/* <div className='form-row'>
              <div className='form-label'>
                <input
                  type='checkbox' id='noScaling' name='noScaling' checked={!!noScaling}
                  onChange={(event) => setUI({noScaling: event.target.checked})}
                />
              </div>
              <div className='form-field'>
                <label htmlFor='noScaling'><Trans i18nKey='view_controls.no_scaling_label'>Preserve vertical scale</Trans></label>
              </div>
            </div> */}

            <div className='form-row form-single buttons'>
              <button onClick={() => { resetUI(); close() }}><Trans i18nKey='view_controls.reset_button'>Reset to defaults</Trans></button>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <button onClick={() => close()}><Trans i18nKey='view_controls.done_button'>Done</Trans></button>
            </div>

          </div>
        )}
        </Popup>
      </section>
      <span className='separator'>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
      {search === undefined &&
        <section className='search'>
          <button onClick={handleSearchClick}>
            <FontAwesomeIcon icon={faSearch} />&nbsp;
            <Trans i18nKey='view_controls.search_button'>Search</Trans>
          </button>
        </section>
      }
      {search !== undefined &&
        <section className='search'>
          <FontAwesomeIcon icon={faSearch} />&nbsp;
          <input ref={searchRef} type='text' value={search} onChange={(event) => setUI({search: event.target.value})}/>
          <button onClick={() => setUI({search: undefined})}>
            <FontAwesomeIcon icon={faTimes} />&nbsp;
          </button>
        </section>
      }

      <KeyboardEventHandler
        handleKeys={['ctrl+f', 'meta+f', 'esc']}
        handleFocusableElements={true}
        onKeyEvent={handleFindKey}
      />

    </div>
  )
}

export default connect(
  (state, ownProps) => ({
    search: state.ui.search,
    view: state.ui.view,
    sort: state.ui.sort,
    filter: state.ui.filter,
    weeks: state.ui.weeks,
    totals: state.ui.totals,
    noScaling: state.ui.noScaling
  }),
  (dispatch, props) => ({
    setUI: (values) => {
      props.listRef && props.listRef.current.resetAfterIndex(0)
      dispatch({ type: 'UI.SET', values })
    },
    resetUI: () => {
      props.listRef && props.listRef.current.resetAfterIndex(0)
      dispatch({ type: 'UI.RESET' })
    },
  })
)(ViewControls)
