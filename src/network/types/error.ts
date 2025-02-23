export class ServerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ServerError'
  }
}

export class SudoRequiredError extends Error {
  constructor(message: string = 'Sudo verification required') {
    super(message)
    this.name = 'SudoRequiredError'
  }
}
