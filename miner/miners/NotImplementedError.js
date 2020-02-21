class NotImplemented extends Error {
  constructor (message = 'Required', ...args) {
    super(message, ...args)
    this.message = `${message} has not yet been implemented.`
  }
}

module.exports = NotImplemented
