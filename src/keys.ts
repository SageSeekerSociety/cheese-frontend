import { InjectionKey, Ref } from 'vue'
import { Question } from './types'

export const questionDataInjectionKey = Symbol('questionDataInjectionKey') as InjectionKey<Ref<Question | null>>

export const refreshInjectionKey = Symbol('refreshInjectionKey') as InjectionKey<() => void>
