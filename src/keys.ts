import { InjectionKey, Ref } from 'vue'
import { Question, Team } from './types'

export const questionDataInjectionKey = Symbol('questionDataInjectionKey') as InjectionKey<Ref<Question | null>>

export const refreshInjectionKey = Symbol('refreshInjectionKey') as InjectionKey<() => void>

export const teamDataInjectionKey = Symbol('teamDataInjectionKey') as InjectionKey<Ref<Team | undefined>>
