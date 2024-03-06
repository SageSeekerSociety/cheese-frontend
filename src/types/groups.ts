import { GroupRoleType, GroupTargetFrequency, GroupTargetMaterialType, GroupMemberInvitationStatus } from '@/constants'
import { Topic, User } from '.'

export type Group = {
  id: number
  name: string
  intro: string
  topics: Topic[]
  owner: User
  created_at: number
  updated_at: number
  member_count: number
  question_count: number
  answer_count: number
  is_member: boolean
  role: GroupRoleType
}

export type GroupMembership = {
  created_at: number
  from: 'APPLICATION' | 'INVITATION'
  joined_at: number
  is_pending: boolean
}

export type GroupMember = {
  user: User
  membership: GroupMembership
  role: GroupRoleType
  contributions: {
    score: number
    question_count: number
    answer_count: number
    check_in_count: number
  }
}

export type GroupMemberInvitation = {
  id: number
  group: Group
  inviter: User
  invitee: User
  created_at: number
  status: GroupMemberInvitationStatus
}

export type GroupTarget = {
  id: number
  name: string
  intro: string
  created_at: number
  start_time: number
  is_timed: boolean
  end_time: number
  frequency: GroupTargetFrequency
  is_material_required: boolean
  materials: GroupTargetMaterial[]
}

export type GroupTargetMaterial = {
  type: GroupTargetMaterialType
  allow_multiple: boolean
  allow_file_type: string[]
  title: string
  description: string
  required: boolean
}

export type GroupTargetMaterialSubmission = {
  type: GroupTargetMaterialType
  content?: string
  material_ids?: number[]
}

export type GroupTargetCheckIn = {
  id: number
  member: GroupMember
  target: GroupTarget
  created_at: number
  updated_at: number
  materials: GroupTargetMaterialSubmission[]
  approved: boolean
}

export type GroupJoinQuestion = {
  title: string
  content: string
  answers: string[]
  ignore_case: boolean
  is_open: boolean
}

export type GroupSettings = {
  join_type: 'OPEN' | 'APPLICATION' | 'INVITATION_ONLY'
  join_questions: GroupJoinQuestion[]
}
