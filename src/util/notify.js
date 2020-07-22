import { Notify } from 'quasar'

let instance = null

export default {
  succ(msg) {
    if (instance) {
      instance()
    }
    instance = Notify.create({
      type: 'positive',
      message: msg
    })
  },
  err(msg) {
    if (instance) {
      instance()
    }
    instance = Notify.create({
      type: 'negative',
      message: msg
    })
  }
}
