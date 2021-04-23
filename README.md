
# async-flow

> Call functions in different synchronous flow(tick/phase).

## Usage

```js
// preparation codes

let count = 0
function log() {
    return console.log.bind(console, ++count)
}
const asyncFlow = require('@lakca/async-flow')
const { Flows } = asyncFlow
```

(default) `asyncFor = setTimeout`

```js
asyncFlow(log)(log)(log)

log()

setTimeout(log)
// output: 1, 4, 2, 5, 3
```

`asyncFor = process.nextTick`

```js
asyncFlow(log, process.nextTick)(log)(log)

log()

asyncFor(log)
// output: 1, 4, 2, 5, 3
```

Alternative

```js
const flows = new Flows()
flows.push(log)
flows.push(log)
flows.push(log)
log()
setTimeout(log)
// output: 1, 4, 2, 5, 3
```

## Example

```js
asyncFlow(() => {
    // create and place element in a flex flow.
})(() => {
    // * rendering dom has been executed at the between.
    // calculate the element layout and do related things.
})
```
