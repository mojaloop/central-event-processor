const Utility = require('./src/lib/utility')

const messages = [
  {
    id: '86ce97cf-2302-4d64-8b0e-df5ae9355dd0',
    from: 'central-switch',
    to: 'dfsp2',
    content: {
      headers: {
        'Content-Type': 'application/json',
        Date: '2019-01-17T14:46:48.918Z',
        'FSPIOP-Source': 'central-switch',
        'FSPIOP-Destination': 'dfsp2'
      },
      payload: {
        currency: 'USD',
        value: 0,
        changedDate: '2019-01-17T14:46:48.918Z'
      }
    },
    type: 'application/json',
    metadata: {
      event: {
        id: '5c7ff308-35be-46b0-b187-0bf4bee72cf8',
        type: 'notification',
        action: 'settlement-transfer-position-change',
        state: {
          status: 'success',
          code: 0,
          description: 'action successful'
        }
      },
      'protocol.createdAt': 1547736408918
    }
  },
  {
    id: '86ce97cf-2302-4d64-8b0e-df5ae9355dd0',
    from: 'central-switch',
    to: 'dfsp1',
    content: {
      headers: {
        'Content-Type': 'application/json',
        Date: '2019-01-17T14:46:48.918Z',
        'FSPIOP-Source': 'central-switch',
        'FSPIOP-Destination': 'dfsp2'
      },
      payload: {
        currency: 'USD',
        value: 0,
        changedDate: '2019-01-17T14:46:48.918Z'
      }
    },
    type: 'application/json',
    metadata: {
      event: {
        id: '5c7ff308-35be-46b0-b187-0bf4bee72cf8',
        type: 'notification',
        action: 'settlement-transfer-position-change',
        state: {
          status: 'success',
          code: 0,
          description: 'action successful'
        }
      },
      'protocol.createdAt': 1547736408918
    }
  },
  {
    id: '86ce97cf-2302-4d64-8b0e-df5ae9355dd0',
    from: 'central-switch',
    to: 'dfsp11',
    content: {
      headers: {
        'Content-Type': 'application/json',
        Date: '2019-01-17T14:46:48.918Z',
        'FSPIOP-Source': 'central-switch',
        'FSPIOP-Destination': 'dfsp2'
      },
      payload: {
        currency: 'USD',
        value: 0,
        changedDate: '2019-01-17T14:46:48.918Z'
      }
    },
    type: 'application/json',
    metadata: {
      event: {
        id: '5c7ff308-35be-46b0-b187-0bf4bee72cf8',
        type: 'notification',
        action: 'settlement-transfer-position-change',
        state: {
          status: 'success',
          code: 0,
          description: 'action successful'
        }
      },
      'protocol.createdAt': 1547736408918
    }
  },
  {
    id: '86ce97cf-2302-4d64-8b0e-df5ae9355dd0',
    from: 'central-switch',
    to: 'dfsp12',
    content: {
      headers: {
        'Content-Type': 'application/json',
        Date: '2019-01-17T14:46:48.918Z',
        'FSPIOP-Source': 'central-switch',
        'FSPIOP-Destination': 'dfsp2'
      },
      payload: {
        currency: 'USD',
        value: 0,
        changedDate: '2019-01-17T14:46:48.918Z'
      }
    },
    type: 'application/json',
    metadata: {
      event: {
        id: '5c7ff308-35be-46b0-b187-0bf4bee72cf8',
        type: 'notification',
        action: 'settlement-transfer-position-change',
        state: {
          status: 'success',
          code: 0,
          description: 'action successful'
        }
      },
      'protocol.createdAt': 1547736408918
    }
  }

]

let count = 0

const messageSubimtter = async (message) => {
  try {
    const success = {
      status: 'success',
      code: 0,
      description: 'action successful'
    }
    await Utility.produceGeneralMessage('notification', 'settlement-transfer-position-change', message, success)
    console.log('Message on kafka queue # ', ++count)
  } catch (err) {
    console.log('Message wasnt placed on Kaka queue : ' + err)
  }
}

const flood = async (count) => {
  for (let i = 0; i < count; i++) {
    for (const message of messages) {
      await messageSubimtter(message)
    }
  }
}

flood(20)
