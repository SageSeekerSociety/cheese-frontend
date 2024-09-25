export enum AvatarType {
  predefined = 'predefined',
}

export interface Avatar {
  id: number
  type: AvatarType
  url: string
}
