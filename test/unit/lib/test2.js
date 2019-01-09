function apiCall(arg, callback) {
  if (typeof arg !== 'string')
       response =   process.nextTick(callback, new TypeError('argument should be string'));
  return response
}

// let callback = () => {console.log('!! callback !!')}
// let callback = () => {}

apiCall(1, callback)