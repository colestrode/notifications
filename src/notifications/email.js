'use strict'

const q = require('q')
const _ = require('lodash')
const logger = require('../lib/logger')
const vars = require('../lib/vars')
const SparkPost = require('sparkpost')
const client = new SparkPost(vars.sparkpost.apiKey, {})
const sendTransmission = q.nbind(client.transmissions.send, client.transmissions)

module.exports.send = function (recipients) {
  const recipientsToNotify = getRecipientsToNotify(recipients)
  const groupedRecipients = groupRecipients(recipientsToNotify)
  const templates = _.keys(groupedRecipients).sort() // sort to make this deterministic for testing

  return q.all(_.map(templates, (template) => {
    return send(template, groupedRecipients[template])
  })).then(() => {
    logger.info('Email notification sent to ' + recipientsToNotify.length + ' recipients.')
  })
}

/**
 * Given a list of recipients, returns a new array of recipients that should be notified.
 *
 * recipients that should be notified are either new recipients or who have an appointment two days from now
 */
function getRecipientsToNotify (recipients) {
  return _.filter(recipients, (recipient) => {
    return recipient.isNew || recipient.twoDays
  })
}

/**
 * Groups recipients by template
 */
function groupRecipients (recipients) {
  return _.groupBy(recipients, (recipient) => {
    return recipient.isNew ? 'new-appointment' : 'appointment-reminder'
  })
}

/**
 * Sends an email to a set of recipients using the given template ID
 */
function send (templateId, recipients) {
  return sendTransmission({
    transmissionBody: {
      campaignId: 'patient-reminder',
      content: {
        templateId: templateId
      },
      recipients: _.map(recipients, makeRecipient)
    },
    'num_rcpt_errors': 10
  })
}

/**
 * Formats a recipient into a SparkPost recipient
 */
function makeRecipient (recipient) {
  let fullname = recipient.firstname
  if (!fullname) {
    fullname = recipient.email
  } else if (recipient.lastname) {
    fullname += ` ${recipient.lastname}`
  }

  return {
    address: {
      name: fullname,
      email: recipient.email
    },
    'substitution_data': _.cloneDeep(recipient)
  }
}
