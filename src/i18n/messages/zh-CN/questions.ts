export default {
  ask: {
    buttons: {
      addTopic: '添加话题（至少一个） | 添加话题（1/5） | 添加话题（{count}/5）',
      createTopic: '创建 {name} 话题',
    },
  },
  detail: {
    createdAt: '发布于 {time}',
    updatedAt: '编辑于 {time}',
    viewCount: '暂无浏览 | 浏览 1 次 | 浏览 {count} 次',
    buttons: {
      follow: '关注 | 关注 1 | 关注 {count}',
      unfollow: '取消关注',
      comment: '评论',
      favorite: '收藏',
      unfavorite: '取消收藏',
      postAnswer: '发布回答',
      allAnswers: '查看全部回答 | 查看全部 {count} 条回答',
      invite: '邀请回答',
    },
    postAnswerTitle: '回答问题',
    postAnswerPlaceholder: '请输入你的回答',
    postAnswerSuccess: '发布回答成功',
    postAnswerEmpty: '回答内容不能为空',
    postAnswerExist: '你已经回答过该问题，点击查看',
    inviteTitle: '邀请其他人回答，更快获得答案',
  },
  answerList: {
    title: '全部回答',
  },
  invitationList: {
    buttons: {
      invite: '邀请回答',
      invited: '已邀请',
    },
    errors: {
      inviteFailed: '邀请失败：{reason}',
    },
  },
}
