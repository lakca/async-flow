var defaultAsyncFor = setTimeout.bind(void 0)

function Flows(asyncFor) {
  this._asyncFor = asyncFor || defaultAsyncFor
  this._started = false
  this._super = Object.getPrototypeOf(Object.getPrototypeOf(this))
}

Flows.prototype = Object.create(Array.prototype)

Flows.prototype.asyncFor = function(asyncFor) {
  if (asyncFor) this._asyncFor = asyncFor
  return this
}

Flows.prototype.push = function() {
  var args = this._super.slice.call(arguments)
  var self = this
  args.forEach(function(arg) {
    if (arg) self._super.push.call(self, arg)
  })
  this._start()
  return this
}

Flows.prototype._start = function() {
  if (this._started) return
  this._started = true
  var self = this
  var flow = this.shift()
  if (flow) {
    flow()
    this._asyncFor(function() {
      self._started = false
      self._start()
    })
  } else {
    this._started = false
  }
  return this
}

/**
 * Call functions in different synchronous flow(tick/phase).
 *
 * @param {function} flow function to be called in a standalone synchronous flow
 * @param {function} [asyncFor=setTimeout] function to create a standalone synchronous flow
 * @example
 * const asyncFor = process.nextTick
 * let count = 0
 * const a = { get log() { return ((n) => () => console.log(n))(++count) }}
 * asyncFlow(a.log, asyncFor)(a.log)(a.log)
 * a.log()
 * process.nextTick(a.log)
 * // output: 1, 4, 2, 5, 3
 * @more find more examples in test.js
 */
module.exports = function asyncFlow(flow, asyncFor) {
  var flows = this instanceof Flows ? this : new Flows()
  flows.asyncFor(asyncFor).push(flow)
  return asyncFlow.bind(flows)
}

module.exports.Flows = Flows
