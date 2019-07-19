const Logger = require('@mojaloop/central-services-shared').Logger
const Rx = require('rxjs')
const { filter, flatMap, retry, delay, retryWhen, repeat, repeatWhen, catchError } = require('rxjs/operators')

const arrO = Rx.from([1, 2, 3, 4, 5, 6, 7])

const mapped = arrO.pipe(
  flatMap(v => {
    return Rx.from([2 * v])
  }),
  delay(1000),
  flatMap(v => {
    if (v === 8) return Rx.throwError('error')
    else return Rx.from([v])
  }),
  catchError(e => {
    return Rx.of(undefined)
  })
)

mapped.subscribe({
  next: v => Logger.debug(v)
})
