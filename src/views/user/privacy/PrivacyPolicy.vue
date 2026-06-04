<template>
  <div class="privacy-policy">
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5 font-weight-medium mb-0">隐私政策</h2>
      <v-chip color="primary" variant="tonal" size="small" class="status-chip">
        <template #prepend>
          <v-icon icon="mdi-shield-lock" size="small"></v-icon>
        </template>
        最近更新: 2023/12/01
      </v-chip>
    </div>

    <p class="text-body-2 text-medium-emphasis mb-6">
      本隐私政策阐述了我们如何收集、使用、保护和共享您的个人信息，以及您对这些信息的控制权限。
      请仔细阅读，以了解我们的数据处理方式和您的权利。
    </p>

    <!-- 政策导航卡片 -->
    <v-card class="mb-8 navigation-card" variant="flat" rounded="lg">
      <v-card-text>
        <div class="d-flex align-center mb-4">
          <v-avatar rounded size="42" class="primary-soft mr-3">
            <v-icon icon="mdi-text-box-search" size="24" color="primary"></v-icon>
          </v-avatar>
          <div class="text-subtitle-1 font-weight-medium">快速导航</div>
        </div>

        <v-row class="policy-nav">
          <v-col cols="12" sm="6" md="3">
            <v-btn
              variant="flat"
              color="primary"
              block
              class="nav-btn justify-start"
              @click="scrollToSection('information-collection')"
            >
              <v-icon icon="mdi-file-document-outline" class="mr-2"></v-icon>
              信息收集
            </v-btn>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-btn
              variant="flat"
              color="primary"
              block
              class="nav-btn justify-start"
              @click="scrollToSection('information-usage')"
            >
              <v-icon icon="mdi-clipboard-text-outline" class="mr-2"></v-icon>
              信息使用
            </v-btn>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-btn
              variant="flat"
              color="primary"
              block
              class="nav-btn justify-start"
              @click="scrollToSection('information-protection')"
            >
              <v-icon icon="mdi-shield-check" class="mr-2"></v-icon>
              信息保护
            </v-btn>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-btn
              variant="flat"
              color="primary"
              block
              class="nav-btn justify-start"
              @click="scrollToSection('user-rights')"
            >
              <v-icon icon="mdi-account-check" class="mr-2"></v-icon>
              用户权利
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 政策内容 -->
    <v-card class="mb-6 policy-card" variant="flat" rounded="lg">
      <v-card-text>
        <!-- 信息收集 -->
        <div id="information-collection" class="policy-section mb-8">
          <div class="section-header d-flex align-start mb-4">
            <v-avatar rounded size="42" class="primary-soft mr-3">
              <v-icon icon="mdi-file-document-outline" size="24" color="primary"></v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-medium mb-1">信息收集</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">我们收集哪些信息以及如何收集</p>
            </div>
          </div>

          <div class="section-content">
            <h4 class="text-subtitle-2 font-weight-medium mb-2">账户信息</h4>
            <p class="text-body-2 mb-4">
              当您注册账户时，我们会收集您的用户名、电子邮件地址和密码。这些信息用于创建和管理您的账户，以及验证您的身份。
            </p>

            <h4 class="text-subtitle-2 font-weight-medium mb-2">实名信息</h4>
            <p class="text-body-2 mb-4">
              对于需要实名认证的赛题和项目，我们会收集您的真实姓名、学号、年级、专业和班级等信息。
              这些信息是选填的，仅在您参与特定需要实名认证的活动时才需要提供。所有实名信息都会进行加密存储。
            </p>

            <h4 class="text-subtitle-2 font-weight-medium mb-2">使用数据</h4>
            <p class="text-body-2 mb-2">我们会收集有关您如何使用我们平台的数据，包括：</p>
            <ul class="text-body-2 mb-4">
              <li>访问日志和IP地址</li>
              <li>您访问的页面和功能</li>
              <li>设备信息（浏览器类型、操作系统等）</li>
              <li>点击和浏览行为</li>
            </ul>

            <h4 class="text-subtitle-2 font-weight-medium mb-2">Cookies和类似技术</h4>
            <p class="text-body-2 mb-0">
              我们使用cookies和类似技术来增强您的浏览体验，记住您的偏好设置，并提供个性化的服务。
              您可以通过浏览器设置控制cookies的使用。
            </p>
          </div>
        </div>

        <!-- 信息使用 -->
        <v-divider class="my-4"></v-divider>

        <div id="information-usage" class="policy-section mb-8">
          <div class="section-header d-flex align-start mb-4">
            <v-avatar rounded size="42" class="primary-soft mr-3">
              <v-icon icon="mdi-clipboard-text-outline" size="24" color="primary"></v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-medium mb-1">信息使用</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">我们如何使用您的信息</p>
            </div>
          </div>

          <div class="section-content">
            <h4 class="text-subtitle-2 font-weight-medium mb-2">提供服务</h4>
            <p class="text-body-2 mb-4">
              我们使用您的信息来提供、维护和改进我们的平台和服务，包括处理您的请求，响应您的查询，
              以及提供技术支持和客户服务。
            </p>

            <h4 class="text-subtitle-2 font-weight-medium mb-2">赛题参与</h4>
            <p class="text-body-2 mb-4">
              对于需要实名认证的赛题，我们会使用您的实名信息进行资格验证、结果认证和奖项发放等。
              这些信息仅在必要时由授权人员访问，且每次访问都会被记录。
            </p>

            <h4 class="text-subtitle-2 font-weight-medium mb-2">安全与防欺诈</h4>
            <p class="text-body-2 mb-4">
              我们使用您的信息来验证身份、防止欺诈行为和保护账户安全， 以及检测和防止平台上的恶意活动和违规行为。
            </p>

            <h4 class="text-subtitle-2 font-weight-medium mb-2">分析与改进</h4>
            <p class="text-body-2 mb-0">
              我们会分析用户行为数据来了解您如何使用我们的服务，以便改进用户体验、开发新功能，
              并提升平台的整体质量。这些分析通常基于匿名化或聚合数据。
            </p>
          </div>
        </div>

        <!-- 信息保护 -->
        <v-divider class="my-4"></v-divider>

        <div id="information-protection" class="policy-section mb-8">
          <div class="section-header d-flex align-start mb-4">
            <v-avatar rounded size="42" class="primary-soft mr-3">
              <v-icon icon="mdi-shield-check" size="24" color="primary"></v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-medium mb-1">信息保护</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">我们如何保护您的信息安全</p>
            </div>
          </div>

          <div class="section-content">
            <h4 class="text-subtitle-2 font-weight-medium mb-2">数据加密</h4>
            <p class="text-body-2 mb-4">
              所有敏感信息（特别是实名信息）都通过行业标准的加密技术进行存储和传输，
              确保未经授权的人员无法访问这些数据。
            </p>

            <h4 class="text-subtitle-2 font-weight-medium mb-2">访问控制</h4>
            <p class="text-body-2 mb-4">
              我们实施严格的访问控制政策，只有经过授权的工作人员才能在特定场景下访问用户信息，
              且每次访问都会被详细记录，并可供用户查看。
            </p>

            <h4 class="text-subtitle-2 font-weight-medium mb-2">安全审计</h4>
            <p class="text-body-2 mb-4">
              我们定期进行安全审计和漏洞扫描，确保系统安全并及时修复潜在的风险。
              我们的安全团队持续监控系统，防止未授权访问和数据泄露。
            </p>

            <h4 class="text-subtitle-2 font-weight-medium mb-2">数据隔离</h4>
            <p class="text-body-2 mb-0">
              您的实名信息和平台账号信息严格隔离，确保您的日常活动保持匿名， 其他用户无法将您的平台活动与实名身份关联。
            </p>
          </div>
        </div>

        <!-- 用户权利 -->
        <v-divider class="my-4"></v-divider>

        <div id="user-rights" class="policy-section">
          <div class="section-header d-flex align-start mb-4">
            <v-avatar rounded size="42" class="primary-soft mr-3">
              <v-icon icon="mdi-account-check" size="24" color="primary"></v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-medium mb-1">用户权利</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">您对自己信息的控制权</p>
            </div>
          </div>

          <div class="section-content">
            <h4 class="text-subtitle-2 font-weight-medium mb-2">访问与修改</h4>
            <p class="text-body-2 mb-4">
              您有权访问和修改您的个人信息，包括账户信息和实名信息。 您可以在账户设置中随时更新这些信息。
            </p>

            <h4 class="text-subtitle-2 font-weight-medium mb-2">访问记录查看</h4>
            <p class="text-body-2 mb-4">
              您可以查看所有对您实名信息的访问记录，包括访问者、访问时间、访问原因等详细信息，
              确保您的信息使用透明可追溯。
            </p>

            <h4 class="text-subtitle-2 font-weight-medium mb-2">数据删除</h4>
            <p class="text-body-2 mb-4">
              您可以要求删除您的部分或全部个人信息。但请注意，某些信息可能因法律要求或合法理由而保留一段时间。
            </p>

            <h4 class="text-subtitle-2 font-weight-medium mb-2">权限管理</h4>
            <p class="text-body-2 mb-0">
              您可以控制哪些赛题和项目能够使用您的实名信息，并可随时撤销或限制授权。
              在信任与隐私中心，您可以详细了解所有需要实名信息的赛题并进行管理。
            </p>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { useGoTo } from 'vuetify'

const goTo = useGoTo()

// 修改滚动函数
const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    const offset = getComputedStyle(element).getPropertyValue('--v-layout-top').replace('px', '').trim()
    console.log(offset)
    goTo(`#${sectionId}`, { offset: -parseInt(offset) })
  }
}
</script>

<style scoped lang="scss">
.privacy-policy {
  // 添加滚动行为
  scroll-behavior: smooth;

  .status-chip {
    font-weight: 500;
  }

  .navigation-card {
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.02), rgba(var(--v-theme-primary), 0.04));

    .nav-btn {
      text-transform: none;
      letter-spacing: normal;
      height: 48px;
      opacity: 0.9;

      &:hover {
        opacity: 1;
      }
    }
  }

  .policy-card {
    background-color: #ffffff;
    border: 1px solid rgba(var(--v-border-color), 0.12);

    .policy-section {
      scroll-margin-top: 80px;
    }

    .section-content {
      padding-left: 56px;

      ul {
        padding-left: 18px;
      }
    }
  }

  .primary-soft {
    background-color: rgba(var(--v-theme-primary), 0.08);
  }
}
</style>
