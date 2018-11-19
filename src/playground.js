
const Rx = require('rxjs')
const { zipAll, zip, take, concat, combineLatest, mergeMap, share, concatMap, map, switchAll, switchMapTo, concatAll, concatMapTo, combineAll, pipe, switchMap, publish, multicast } = require('rxjs/operators')
const request = require('request-promise')

let counter = 0

const requestLimitPerName = async (name) => {
  try {
    console.log(++counter)
    const limit = await request({ uri: `http://localhost:3001/participants/${name}/limits`, json: true })
    return limit
  } catch (e) {
    throw e
  }
}

const getLimitPerNameObservable = (name) => {
  return Rx.Observable.create(async observer => {
    const limitResponse = await requestLimitPerName(name)
    let result = {}
    result[name] = limitResponse
    observer.next(result)
    observer.complete()
  })
}

const subject = new Rx.Subject()
// const stream = Rx.from(['dfsp1', 'dfsp2']).pipe(mergeMap(getLimitPerNameObservable))
const getLimitPerNameSubject = (name) => {
  let c = getLimitPerNameObservable(name).pipe(share())
  c.subscribe(c => console.log('cunt'))
  return Rx.Observable.create(observer => { c.subscribe(v => observer.next(v)) })
}

const getLimitPerNameObserver = () => {
  let a = {}
  return {
    next: value => { console.log(value) },
    error: (error) => { console.error(error) },
    complete: () => { return a }
  }
}
// getLimitPerNameSubject('dfsp1').connect()

// const allDfsps = ['dfsp1', 'dfsp2'].map(name => getLimitPerNameSubject(name))
// const allDfspsObservable = Rx.forkJoin(allDfsps)
// allDfspsObservable.subscribe(getLimitPerNameObserver())
// const stream = Rx.from(['dfsp1', 'dfsp2']).pipe(mergeMap(getLimitPerNameSubject), share())

getLimitPerNameSubject('dfsp1').subscribe(v => console.log(v))

// stream.subscribe(subject)

// subject.subscribe(a => { console.log(a) }, e => { throw e }, () => { console.log('d')})

// v => console.log(v),
  // err => { throw err },
  // () => console.log('done'))

// const combineTwoLimitsObserver()

// stream.subscribe(subject)

// const source = stream.pipe(zipAll(getLimitPerNameObservable), publish())
// source.connect()
// stream.connect()
// stream.subscribe(subject)
// subject.subscribe(getLimitPerNameObserver())

// const observer = () => {
//   {
//     let a = {}
//     return {
//       next: (v) => {
//         a = Object.assign(a, v)
//       },
//       error: (e) => { console.error(e) },
//       complete: () => { return JSON.stringify(a) }
//     }
//   }
// }

// let a = subject.subscribe(observer())
// subject.subscribe(combineTwoLimitsObserver)
// const task = function (action) {
//   console.log(action)
//   if (action) {
//     this.schedule()
//   }
// }

// let a = {
//   isActive: true
// }

// const task = function (a) {
//   if (a.isActive) {
//     console.log('isActive')
// //    this.schedule(a, 1000)
//   }
// }

// Rx.asyncScheduler.schedule(task, 1000, a)

// const interval = Rx.interval
// const { switchMap, concat, concatMap, pipe} = require('rxjs/operators')
// const obs1 = interval(1000, 4)

// const obs2 = (v) => {
//   return Rx.Observable.create(async observer => {
//     observer.next(v * 2)
//   })
// }

// const obs3 = obs1.pipe(switchMap(obs2))

// const subs = obs3.subscribe(d => console.log(d))

// const from = Rx.from

// // subject.subscribe({
// //   next: v => console.log('A', v)
// // })

// // subject.subscribe({
// //   next: v => console.log('B', v)
// // })

// // observable.subscribe(subject)

// // ====================================================================

// // const RuleEngine = require('json-rules-engine')
// // let engine = new RuleEngine.Engine()

// // let conditions = {
// //   any: [{
// //     fact: 'a',
// //     operator: 'equal',
// //     value: 1
// //   }]
// // }

// // let event = {
// //   type: 'a-is-here',
// //   params: {
// //     message: 'the position is under the threshold! RING THE ALARM!',
// //     action: a => {
// //       console.log('action', a)
// //     }
// //   }
// // }

// // let conditions2 = {
// //   any: [{
// //     fact: 'a',
// //     operator: 'equal',
// //     value: 1
// //   }]
// // }

// // let event2 = {
// //   type: 'b-is-here',
// //   params: {
// //     message: 'the position is under the threshold! RING THE ALARM!'
// //   }
// // }

// // let rule = new RuleEngine.Rule({ conditions, event })
// // let rule2 = new RuleEngine.Rule({ conditions: conditions2, event: event2 })

// // engine.addRule(rule)
// // engine.addRule(rule2)

// // const f = async () => {
// //   let events = await engine.run({a: 1})
// //   for (let event of events) {
// //     if (event.params.action) {
// //       event.params.action('1')
// //     }
// //   }
// // }
// // f()

// const dictionary = {

//   produceToKafkaTopic: (topic, message) => {
//     console.log(topic, message)
//   },

//   sendRequest: ({ url, payload }) => {
//     if (payload === 'error') throw new Error('this is an error')
//     return { url, payload }
//   },

//   sendEmail: (emailAddress, subject, body) => {
//     return console.log('bla')
//   }
// }

// const actionBuilder = (action) => {
//   return dictionary[action]
// }

// const actionObserver = (action, params) => {
//   return Rx.Observable.create(async observer => {
//     try {
//       let actionResult = await actionBuilder(action)(params)
//       observer.next(actionResult)
//       observer.complete()
//     } catch (err) {
//       observer.error(err)
//     }
//   })
// }

// const actionObservable = actionObserver('sendRequest', { url: 'url', payload: 'error' })

// actionObservable.subscribe({
//   next: v => console.log(v),
//   error: err => console.error(err),
//   complete: () => console.log('done')
// })
