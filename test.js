const assert = require('assert')
const asyncFlow = require('./')

class RunOverwrite {
  get asyncFor /* istanbul ignore next */ () {
  }
  get expectation /* istanbul ignore next */ () {
  }
  get max /* istanbul ignore next */ () {
  }
  exec /* istanbul ignore next */ () {
  }
}

class Run extends RunOverwrite {
  constructor() {
    super()
    this.records = 0
    this.output = []
    this.count = 0
    this.done = 0
    this.gone = false
    this.record()
    this.exec()
  }
  get log() {
    if (this.max <= this.count) {
      throw new Error('Exceeding maximum number of calls.')
    }
    ++this.count
    return ((n) =>
      () => {
        this.output.push([this.records, n])
        this.done += 1
        this.expect()
        if (this.max <= this.done) {
          this.gone = true
        }
      })(this.count)
  }
  expect() {
    const ctx = this
    assert.deepStrictEqual(ctx.output, ctx.expectation.slice(0, ctx.output.length))
  }
  record() {
    if (this.gone) {
      this.asyncFor(this.after)
    } else {
      this.records += 1
      this.asyncFor(this.record.bind(this))
    }
  }
  then(fn) {
    this.after = fn
  }

  get expectation() {
    return [
      // tick id, call id
      [1, 1],
      [1, 4],
      [2, 2],
      [2, 5],
      [3, 3]
    ]
  }
  get max() {
    return 5
  }
  exec() {
    const ctx = this

    asyncFlow(ctx.log, ctx.asyncFor)(ctx.log)(ctx.log)

    ctx.log()

    ctx.asyncFor(ctx.log)
  }
}


class TickRun extends Run {
  get asyncFor() {
    return process.nextTick
  }
}

class ImmediateRun extends Run {
  get asyncFor() {
    return setImmediate
  }
}

class TimeoutRun extends Run {
  get asyncFor() {
    return setTimeout
  }
}

/* default asyncFor is setTimeout */
class DefaultRun extends Run {
  get asyncFor() {
    return setTimeout
  }
  exec() {
    const ctx = this

    asyncFlow(ctx.log)(ctx.log)(ctx.log)

    ctx.log()

    this.asyncFor(ctx.log)
  }
}

function suite(...RunClasses) {
  RunClasses.reverse().reduce((cb, RunClass) => {
    return () => new RunClass().then(() => {
      console.log(RunClass.name, 'Passed!')
      cb()
    })
  }, () => console.log('All Passed!'))()
}

suite(TickRun, ImmediateRun, TimeoutRun, DefaultRun)
