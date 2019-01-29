/*!
 * group-by <https://github.com/marco-gagliardi/group-by>
 *
 * Copyright (c) Marco Gagliardi.
 * Released under the MIT License.
 */
 
 'use strict'

function isObject (value) {
  return value && typeof value === 'object' && value.constructor === Object
}

function defaultAggregationFunction (a, b) {
  return parseInt(a) + parseInt(b)
}

/**
 * Groups and filters an array of objects according to custom aggregation logics.
 *
 * @param  {Array} `input` The Array of objects to group/filter.
 * @param  {Array} `groupings` An array of fields to "group by".
 * @param  {Object|Array} `aggregatedFields` Fields to aggregate values on. It can be either an array of
 * fields (simple integer sum will be applied) or a map "<fieldName>: <customAggregationFunction>"
 * @param  {Function} `filterFunction` A custom filtering function.
 * @return {Array} Returns the grouped and sorted array.
 */

const groupBy = function (input, groupings = [], aggregatedFields = [], filterFunction = () => true) {
  if (!Array.isArray(input)) {
    throw new TypeError('Input must be an array of JSON objects')
  }
  if (!Array.isArray(aggregatedFields) && !isObject(aggregatedFields)) {
    throw new TypeError('"aggregatedField" must be either an array of fields to sum up, or a map of pairs "fieldName: aggregationFunction"')
  }
  let array = []
  input.filter(filterFunction).forEach(value => {
    if (!isObject(value)) {
      throw new TypeError('Input must be an array of JSON objects')
    }
    let entryIndex = array.findIndex(elem => {
      for (let i = 0; i < groupings.length; i++) {
        let grouping = groupings[i]
        if (elem[grouping] !== value[grouping]) {
          return false
        }
      }
      return true
    })

    const aggregationMap = isObject(aggregatedFields)
      ? aggregatedFields
      : aggregatedFields.reduce((acc, current) => {
        return {...acc, [current]: defaultAggregationFunction}
      }, {})
    const fieldsToAggregate = Object.keys(aggregationMap)
    if (entryIndex === -1) {
      let obj = {}
      for (let i = 0; i < groupings.length; i++) {
        let grouping = groupings[i]
        obj[grouping] = value[grouping]
      }
      for (let i = 0; i < fieldsToAggregate.length; i++) {
        let aggregator = fieldsToAggregate[i]
        obj[aggregator] = value[aggregator]
      }
      array.push(obj)
    } else {
      for (let i = 0; i < fieldsToAggregate.length; i++) {
        let aggregator = fieldsToAggregate[i]
        array[entryIndex][aggregator] = aggregationMap[aggregator](array[entryIndex][aggregator], value[aggregator])
      }
    }
  })
  return array
}

export default groupBy
