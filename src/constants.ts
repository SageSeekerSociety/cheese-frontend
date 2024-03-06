export enum AttitudeType {
  None = 0,
  Agree = 1,
  Disagree = 2,
}

export enum CommentableType {
  Answer = 'ANSWER',
  Comment = 'COMMENT',
  Insight = 'INSIGHT',
  Question = 'QUESTION',
}

export enum NewAttitudeType {
  None = 'UNDEFINED',
  Positive = 'POSITIVE',
  Negative = 'NEGATIVE',
}

export enum GroupRoleType {
  Owner = 'OWNER',
  Admin = 'ADMIN',
  Member = 'MEMBER',
}

export enum GroupMemberInvitationStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
}

export enum GroupTargetFrequency {
  Once = 'ONCE',
  Daily = 'DAILY',
  Weekly = 'WEEKLY',
  Monthly = 'MONTHLY',
}

export enum GroupTargetMaterialType {
  Text = 'TEXT',
  Image = 'IMAGE',
  Video = 'VIDEO',
  File = 'FILE',
}
