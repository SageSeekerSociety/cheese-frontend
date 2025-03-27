export class ServerError extends Error {
  code: number

  constructor(message: string, code: number) {
    super(message)
    this.name = 'ServerError'
    this.code = code
  }
}

export class SudoRequiredError extends Error {
  constructor(message: string = 'Sudo verification required') {
    super(message)
    this.name = 'SudoRequiredError'
  }
}
