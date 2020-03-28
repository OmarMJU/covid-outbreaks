import React from 'react'
import { formatDateMonthAbbrDD } from '../../utils/dateFormats'
import { DateTime } from 'luxon'

const markerWidth = 12
const markerHeight = 4

const SVG_STYLES = {
  weekLines: {
    stroke: '#555',
    strokeWidth: 0.6,
  },
  emptyMarker: {
    fill: '#444',
    markerWidth,
    markerHeight,
    radius: 0.5
  },
  deathMarker: {
    fill: '#f00',
    stroke: '#900',
    strokeWidth: 0.5,
    markerWidth,
    markerHeight,
    radius: 1.3
  },
  groupedDeathMarker: {
    fill: '#f33',
    stroke: '#700',
    strokeWidth: 0.5,
    markerWidth,
    markerHeight,
    radius: 2.5
  },
  compDeathMarker: {
    fill: '#bb0',
    opacity: 0.2,
    markerWidth,
    markerHeight,
    radius: 1.3
  },
  compGroupedDeathMarker: {
    fill: '#bb1',
    fillOpacity: "0.1",
    markerWidth,
    markerHeight,
    radius: 2.5
  },
  caseMarker: {
    fill: '#636363',
    opacity: 1,
    markerWidth,
    markerHeight,
    radius: 4.0
  }
}

const DeathsChart =  ({
  entry, dates,
  comparisonEntry, comparisonOffset,
  sideBySide,
  scale, maxScaledValue, columns, casesScale
}) => {
  if (!entry || !entry.daily || !entry.daily.deaths || !entry.daily.cases) return null

  let canvasWidth = dates.length * SVG_STYLES.emptyMarker.markerWidth

  let canvasHeight = ((maxScaledValue / columns) + 1) * SVG_STYLES.emptyMarker.markerHeight + 10

  const firstDateObj = DateTime.fromISO(dates[0])
  const mondayOffset = firstDateObj.weekday - 1

  if (entry.daily.deaths) {
    return (
      <div className='DeathsChart'>
        <svg width={'100%'} viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}>
          {dates.map((date, index) => (
            ((index + mondayOffset) % 7 === 0) && /* + 2 moves the lines to a monday */
              <line
                key={`line_${index}`}
                x1={index * SVG_STYLES.emptyMarker.markerWidth}
                y1={0}
                x2={index * SVG_STYLES.emptyMarker.markerWidth}
                y2={canvasHeight}
                strokeWidth={SVG_STYLES.weekLines.strokeWidth}
                stroke={SVG_STYLES.weekLines.stroke}
              />
            )
          )}
          {dates.map((date, index) => (
            ((index + mondayOffset) % 7 === 0) && /* + 2 moves the lines to a monday */
              <text
                key={`text_${index}`}
                x={index * SVG_STYLES.emptyMarker.markerWidth + 2}
                y={8}
                style={{fontSize: '9px', fill: `${SVG_STYLES.weekLines.stroke}`}}
              >
                {formatDateMonthAbbrDD(date)}
              </text>
            )
          )}
          {dates.map((date, index) => (
            <DeathsChartOneDay
              key={`empty_${date}`}
              dayIndex={index}
              count={1}
              columns={columns}
              height={canvasHeight}
              markerStyle={SVG_STYLES.emptyMarker}
            />
          ))}
          {dates.map((date, index) => (
            entry.daily.cases[date] &&
              <DeathsChartOneDay
                key={`cases_${date}`}
                dayIndex={index}
                count={entry.daily.cases[date] / casesScale / scale }
                columns={columns}
                round={false}
                height={canvasHeight}
                markerStyle={SVG_STYLES.caseMarker}
              />
          ))}
          {comparisonEntry && comparisonEntry.daily && comparisonEntry.daily.deaths &&
            dates.map((date, index) => {
              const compDate = dates[index - comparisonOffset]
              if (comparisonEntry.daily.deaths[compDate]) {
                return (
                  <DeathsChartOneDay
                    key={`comp_deaths_${date}`}
                    dayIndex={index}
                    count={comparisonEntry.daily.deaths[compDate] / scale}
                    columns={columns}
                    round={true}
                    height={canvasHeight}
                    markerStyle={scale === 1 ? SVG_STYLES.compDeathMarker : SVG_STYLES.compGroupedDeathMarker}
                    xOffset={-1}
                    yOffset={1}
                  />
                )
              } else {
                return null
              }
            })
          }
          {dates.map((date, index) => (
            (entry.daily.deaths[date] &&
              <DeathsChartOneDay
                key={`deaths_${date}`}
                dayIndex={index}
                count={entry.daily.deaths[date] / scale}
                columns={columns}
                round={true}
                height={canvasHeight}
                markerStyle={scale === 1 ? SVG_STYLES.deathMarker : SVG_STYLES.groupedDeathMarker}
              />
            )
          ))}
        </svg>
      </div>
    )
  } else {
    return null
  }
}

const DeathsChartOneDay = ({
  dayIndex, count, columns, round, height, markerStyle,
  xOffset = 0, yOffset = 0
}) => {
  let columnCounts = []

  if (count < 1) {
    columnCounts[0] = count
    for (let i = 1; i < columns; i++) {
      columnCounts[i] = 0
    }
  } else if (count < columns) {
    columnCounts[0] = count
    for (let i = 0; count > 0; i++) {
      columnCounts[i] = 1
      count = count - 1
    }
  } else {
    let perColumn = count / columns
    if (round) perColumn = Math.floor(perColumn)

    for (let i = 0; i < columns; i++) {
      columnCounts.push(perColumn)
      count = count - perColumn
    }

    let remainder = count % columns
    for (let i = 0; i < remainder; i++) {
      columnCounts[i] = columnCounts[i] + 1
    }
  }

  let offsetPerColumn = markerStyle.markerWidth / (columns + 1)

  return columnCounts.map(
    (count, index) => (
      <DeathsChartOneColumn
          key={`column_${index + 1}`}
          dayIndex={dayIndex}
          count={count}
          xOffset={xOffset + ((index + 1) * offsetPerColumn)}
          yOffset={yOffset + (markerStyle.markerHeight / 2)}
          height={height}
          style={markerStyle}
        />
    )
  )
}

const DeathsChartOneColumn = ({dayIndex, count, xOffset, yOffset, height, style}) => {
  let markers = []

  let rounded = Math.round(count)

  let radiusScale
  if (rounded < count) {
    radiusScale = (count - rounded)

    if (radiusScale < 0.1) radiusScale = 0.3
    else if (radiusScale < 0.6) radiusScale = 0.6
    else if (radiusScale < 0.75) radiusScale = 0.75
  } else {
    radiusScale = 1
  }

  if (count > 0 && style) {
    let radius
    for (let i = 0; i < count; i++) {
      radius = style.radius * (i < (count - 1) ? 1 : radiusScale)

      markers.push(
        <circle
          key={i}
          cx={(dayIndex * style.markerWidth) + xOffset}
          cy={height - ((i + 1) * style.markerHeight) - yOffset}
          r={radius}
          stroke={style.stroke}
          fill={style.fill}
          strokeWidth={style.strokeWidth}
        />
      )
    }
  }

  return (
    <>{markers}</>
  )
}

export const DeathsChartSampleMarker = ({ type }) => {
  let style = SVG_STYLES[type]

  if (style) {
    return (
      <svg
        style={{ height: '2ex', width: '2ex', position: 'relative', top: '0.5ex' }}
        viewBox={`0 0 ${style.markerWidth} ${style.markerHeight}`}
      >
        <circle
          cx={(style.markerWidth / 2)}
          cy={(style.markerHeight / 2)}
          r={style.radius}
          stroke={style.stroke}
          fill={style.fill}
          strokeWidth={style.strokeWidth}
        />
      </svg>
    )
  } else {
    return null
  }

}
export default  React.memo(DeathsChart)
