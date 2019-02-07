const Rx = require('rxjs')
const Logger = require('@mojaloop/central-services-shared').Logger
const LimitModel = require('../../models/limits').limitModel
const EventModel = require('../../models/events').eventModel
const Enums = require('../../lib/enum')

const getLimitPerNameObservable = ({message}) => {
  return Rx.Observable.create(async observer => {
    try {
      let { limit, currency } = message.value.content.payload
      let name = message.value.from
      const limitResult = await updateLimitsFromMessage(name, currency, limit)
      await createEventsForParticipant(name, limitResult)
      observer.next(limitResult)
      observer.complete()
    } catch (err) {
      Logger.info(`getLimitPerNameObservable exit with error: ${err}`)
      observer.error(err)
    }
  })
}

const createEventsForParticipant = async (name, limit) => {
  try {
    let notificationActions = Enums.limitNotificationMap[limit.type]
    for (let key in notificationActions) {
      if (key !== 'enum') {
        let eventRecord = await EventModel.findOne({ name, currency: limit.currency, limitType: limit.type, notificationEndpointType: key })
        if (!eventRecord) {
          const newEvent = {
            name,
            currency: limit.currency,
            notificationEndpointType: key,
            limitType: limit.type,
            action: notificationActions[key].action,
            templateType: notificationActions[key].templateType,
            language: notificationActions[key].language
          }
          await EventModel.create(newEvent)
        }
      }
    }
  } catch (err) {
    Logger.info(`createEventsForParticipant exit with error: ${err}`)
    throw err
  }
}

const updateLimitsFromMessage = async (name, currency, limit) => {
  try {
    let doc = await LimitModel.findOne({ name, currency, type: limit.type })
    let limitObject = {
      name,
      currency: currency,
      type: limit.type,
      value: limit.value,
      threshold: limit.alarmPercentage
    }
    if (doc) {
      doc.oldValue = doc.value
      doc.value = limit.value
      await doc.save()
      return doc.toObject()
    } else {
      let document = await LimitModel.create(limitObject)
      return document.toObject()
    }
  } catch (err) {
    Logger.info(`updateLimitsFromMessage exit with error: ${err}`)
    throw err
  }
}

module.exports = { getLimitPerNameObservable }
