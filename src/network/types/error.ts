import type { ResponseDataType } from '.'

export class BusinessError extends Error {
  code: number
  error?: {
    name: string
    message: string
    data?: any
  }

  constructor(message: string, code: number, error?: ResponseDataType['error']) {
    super(message)
    this.name = error?.name || 'BusinessError'
    this.code = code
    this.error = error
  }
}

export class ServerError extends BusinessError {
  constructor(message: string, code: number) {
    super(message, code)
    this.name = 'ServerError'
  }
}

export class SudoRequiredError extends BusinessError {
  constructor(message: string = 'Sudo verification required') {
    super(message, 403, {
      name: 'SudoRequiredError',
      message,
    })
  }
}

export class TeamLockedError extends Error {
  code: number
  data?: {
    teamId: number
    lockingTasks: string
  }

  constructor(message: string, data?: { teamId: number; lockingTasks: string }) {
    super(message)
    this.name = 'TeamLockedError'
    this.code = 403
    this.data = data
  }
}

export class ForbiddenError extends Error {
  code: number
  error?: any

  constructor(message: string, error?: any) {
    super(message)
    this.name = 'ForbiddenError'
    this.code = 403
    this.error = error
  }
}
