<template>
  <div class="realname-tasks">
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 font-weight-medium mb-0">需要实名的赛题</h2>
      <v-chip color="primary" variant="tonal" size="small" class="status-chip">
        <template #prepend>
          <v-icon icon="mdi-clipboard-check" size="small"></v-icon>
        </template>
        3 个赛题
      </v-chip>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-6">
      这里列出了所有需要您提供实名信息的赛题。我们仅在您参与的特定赛题中使用您的实名信息，严格控制数据使用范围和权限。
    </p>

    <!-- 赛题列表 -->
    <v-card variant="flat" rounded="lg" class="mb-6 tasks-list-card">
      <v-list>
        <!-- 智慧城市设计挑战赛 -->
        <v-list-item class="task-item py-4">
          <div class="d-flex w-100">
            <v-avatar class="task-icon mr-4 primary-soft">
              <v-icon icon="mdi-city-variant" size="24" color="primary"></v-icon>
            </v-avatar>

            <div class="flex-grow-1">
              <div class="d-flex justify-space-between align-start mb-2">
                <div>
                  <div class="text-subtitle-1 font-weight-medium">智慧城市设计挑战赛</div>
                  <div class="text-caption text-medium-emphasis mb-3">由智慧城市研究院主办</div>
                </div>
                <v-chip size="small" color="success" variant="tonal">进行中</v-chip>
              </div>

              <div class="d-flex flex-wrap gap-4 mb-3">
                <div class="info-item">
                  <div class="text-caption text-medium-emphasis mb-1">提交日期</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-calendar" size="small" color="primary" class="mr-1"></v-icon>
                    <span class="text-body-2">2023年9月15日</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="text-caption text-medium-emphasis mb-1">使用信息</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-card-account-details" size="small" color="primary" class="mr-1"></v-icon>
                    <span class="text-body-2">实名、学号、专业</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="text-caption text-medium-emphasis mb-1">使用目的</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-information" size="small" color="primary" class="mr-1"></v-icon>
                    <span class="text-body-2">项目认证、证书发放</span>
                  </div>
                </div>
              </div>

              <div class="task-description text-body-2 text-medium-emphasis mb-3">
                该赛题要求参赛者设计智慧城市解决方案，需要实名信息用于证书发放和项目成果认证。
              </div>

              <div class="d-flex flex-wrap gap-2">
                <v-chip size="small" variant="flat" color="primary">国家级赛事</v-chip>
                <v-chip size="small" variant="flat" color="grey">团队赛</v-chip>
                <v-chip size="small" variant="flat" color="grey">2学分</v-chip>
              </div>
            </div>
          </div>
        </v-list-item>

        <v-divider></v-divider>

        <!-- 机器学习算法大赛 -->
        <v-list-item class="task-item py-4">
          <div class="d-flex w-100">
            <v-avatar class="task-icon mr-4 primary-soft">
              <v-icon icon="mdi-brain" size="24" color="primary"></v-icon>
            </v-avatar>

            <div class="flex-grow-1">
              <div class="d-flex justify-space-between align-start mb-2">
                <div>
                  <div class="text-subtitle-1 font-weight-medium">机器学习算法大赛</div>
                  <div class="text-caption text-medium-emphasis mb-3">由计算机科学学院主办</div>
                </div>
                <v-chip size="small" color="success" variant="tonal">进行中</v-chip>
              </div>

              <div class="d-flex flex-wrap gap-4 mb-3">
                <div class="info-item">
                  <div class="text-caption text-medium-emphasis mb-1">提交日期</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-calendar" size="small" color="primary" class="mr-1"></v-icon>
                    <span class="text-body-2">2023年10月20日</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="text-caption text-medium-emphasis mb-1">使用信息</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-card-account-details" size="small" color="primary" class="mr-1"></v-icon>
                    <span class="text-body-2">实名、学号、班级</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="text-caption text-medium-emphasis mb-1">使用目的</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-information" size="small" color="primary" class="mr-1"></v-icon>
                    <span class="text-body-2">资格验证、奖项发放</span>
                  </div>
                </div>
              </div>

              <div class="task-description text-body-2 text-medium-emphasis mb-3">
                该赛题要求参赛者开发机器学习算法解决实际问题，需要实名信息用于学分认定和奖项发放。
              </div>

              <div class="d-flex flex-wrap gap-2">
                <v-chip size="small" variant="flat" color="primary">校级赛事</v-chip>
                <v-chip size="small" variant="flat" color="grey">个人赛</v-chip>
                <v-chip size="small" variant="flat" color="grey">1学分</v-chip>
              </div>
            </div>
          </div>
        </v-list-item>

        <v-divider></v-divider>

        <!-- 创新创业项目展示 -->
        <v-list-item class="task-item py-4">
          <div class="d-flex w-100">
            <v-avatar class="task-icon mr-4 primary-soft">
              <v-icon icon="mdi-lightbulb" size="24" color="primary"></v-icon>
            </v-avatar>

            <div class="flex-grow-1">
              <div class="d-flex justify-space-between align-start mb-2">
                <div>
                  <div class="text-subtitle-1 font-weight-medium">创新创业项目展示</div>
                  <div class="text-caption text-medium-emphasis mb-3">由创新创业学院主办</div>
                </div>
                <v-chip size="small" color="info" variant="tonal">已结束</v-chip>
              </div>

              <div class="d-flex flex-wrap gap-4 mb-3">
                <div class="info-item">
                  <div class="text-caption text-medium-emphasis mb-1">提交日期</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-calendar" size="small" color="primary" class="mr-1"></v-icon>
                    <span class="text-body-2">2023年7月10日</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="text-caption text-medium-emphasis mb-1">使用信息</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-card-account-details" size="small" color="primary" class="mr-1"></v-icon>
                    <span class="text-body-2">实名、学号、专业、年级</span>
                  </div>
                </div>

                <div class="info-item">
                  <div class="text-caption text-medium-emphasis mb-1">使用目的</div>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-information" size="small" color="primary" class="mr-1"></v-icon>
                    <span class="text-body-2">项目展示、学分认定</span>
                  </div>
                </div>
              </div>

              <div class="task-description text-body-2 text-medium-emphasis mb-3">
                该活动展示学生创新创业项目成果，需要实名信息用于学分认定和项目展示。
              </div>

              <div class="d-flex flex-wrap gap-2">
                <v-chip size="small" variant="flat" color="primary">校级活动</v-chip>
                <v-chip size="small" variant="flat" color="grey">团队赛</v-chip>
                <v-chip size="small" variant="flat" color="grey">2学分</v-chip>
              </div>
            </div>
          </div>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- 使用说明 -->
    <v-alert
      type="info"
      variant="tonal"
      class="mt-4"
      border="start"
      density="comfortable"
      icon="mdi-information-outline"
    >
      <div class="text-subtitle-2 font-weight-medium mb-1">关于实名赛题</div>
      <p class="text-body-2 mb-0">
        部分赛题因认证、评奖等需要，会要求您提供实名信息。我们仅在必要范围内收集和使用这些信息，并严格控制访问权限。
        您可以在<router-link :to="{ name: 'PrivacyCenterAccessLogs' }" class="text-decoration-none"
          >访问记录</router-link
        >中查看谁访问了您的实名信息。
      </p>
    </v-alert>
  </div>
</template>

<script lang="ts" setup>
// 注意：这是一个示例页面，使用了模拟数据
// 实际生产环境中应该使用后端API获取参与的实名赛题
</script>

<style scoped lang="scss">
.realname-tasks {
  .status-chip {
    font-weight: 500;
  }

  .tasks-list-card {
    background-color: #ffffff;
    border: 1px solid rgba(var(--v-border-color), 0.12);
  }

  .task-item {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(var(--v-theme-on-surface), 0.01);
    }
  }

  .task-icon {
    width: 40px;
    height: 40px;
  }

  .primary-soft {
    background-color: rgba(var(--v-theme-primary), 0.08);
  }

  .info-item {
    min-width: 150px;
  }

  .gap-4 {
    gap: 1rem;
  }

  .gap-2 {
    gap: 0.5rem;
  }
}
</style>
