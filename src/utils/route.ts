export function normalizeRouteParam(param: string | string[] | undefined): string {
  if (param === undefined) return ''
  if (Array.isArray(param)) {
    return param.join('/')
  }
  return param
}

export function normalizeRouteParams(params: Record<string, string | string[]>): Record<string, string> {
  const normalized: Record<string, string> = {}
  Object.entries(params).forEach(([key, value]) => {
    normalized[key] = normalizeRouteParam(value)
  })
  return normalized
}

export function extractParamNames(path: string): string[] {
  const matches = path.match(/:(\w+)[+*?]?/g)
  return matches ? matches.map((match) => match.replace(/[:+*?]/g, '')) : []
}
