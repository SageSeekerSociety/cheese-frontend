<template>
  <v-container class="px-6 py-4" fluid>
    <div v-if="loading" class="loading-container py-8">
      <v-progress-circular indeterminate color="primary" class="mx-auto d-block"></v-progress-circular>
    </div>

    <div v-else>
      <!-- 知识库工具栏 -->
      <div class="mb-4 d-flex align-center flex-wrap gap-4">
        <v-text-field
          v-model="searchQuery"
          label="搜索知识库"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          variant="solo"
          rounded="lg"
          hide-details
          class="knowledge-search"
          clearable
          @update:model-value="loadKnowledges"
        ></v-text-field>

        <v-select
          v-model="filter.type"
          label="资料类型"
          density="compact"
          variant="solo"
          flat
          hide-details
          rounded="lg"
          clearable
          :items="resourceTypes"
          class="resource-type-filter"
          @update:model-value="loadKnowledges"
        ></v-select>

        <v-select
          v-model="filter.tag"
          label="标签"
          density="compact"
          variant="solo"
          flat
          hide-details
          rounded="lg"
          clearable
          :items="availableTags"
          class="tag-filter"
          @update:model-value="loadKnowledges"
        ></v-select>

        <v-spacer></v-spacer>

        <v-btn color="primary" prepend-icon="mdi-upload" class="mr-2" @click="openUploadDialog"> 上传资料 </v-btn>

        <v-btn-toggle v-model="viewMode" density="comfortable" variant="outlined" rounded="lg">
          <v-btn value="grid" icon="mdi-view-grid"></v-btn>
          <v-btn value="list" icon="mdi-view-list"></v-btn>
        </v-btn-toggle>
      </div>

      <!-- 知识库内容 -->
      <div v-if="knowledges.length === 0" class="empty-knowledge-state text-center py-12">
        <v-icon icon="mdi-book-open-page-variant" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
        <h3 class="text-h6 font-weight-medium mb-2">知识库暂无内容</h3>
        <p v-if="hasFilters" class="text-body-2 text-medium-emphasis mb-4">
          没有找到匹配当前筛选条件的资料，请尝试调整筛选条件
        </p>
        <p v-else class="text-body-2 text-medium-emphasis mb-6">
          在频道聊天中添加有价值的内容到知识库，方便团队随时查阅
        </p>
      </div>

      <!-- 网格视图 -->
      <v-row v-else-if="viewMode === 'grid'">
        <v-col v-for="resource in knowledges" :key="resource.id" cols="12" sm="6" md="4" lg="3">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              class="resource-card fill-height"
              rounded="lg"
              :class="isHovering ? 'card-hover' : ''"
              @click="openResourceDetail(resource)"
            >
              <!-- 资料预览区 -->
              <div class="resource-preview" :class="`resource-type-${resource.type.toLowerCase()}`">
                <v-icon
                  v-if="!resource.thumbnail"
                  :icon="getResourceIcon(resource.type, resource.material?.type)"
                  size="48"
                  class="resource-icon"
                ></v-icon>
                <v-img v-else :src="resource.thumbnail" class="resource-thumbnail" cover></v-img>
              </div>

              <!-- 资料信息区 -->
              <v-card-text class="pa-4">
                <div class="d-flex align-center mb-1">
                  <v-icon
                    :icon="getResourceIcon(resource.type, resource.material?.type)"
                    size="16"
                    class="mr-2 resource-type-icon"
                  ></v-icon>
                  <span class="text-caption text-medium-emphasis">{{
                    getResourceTypeName(resource.type, resource.material?.type)
                  }}</span>
                  <v-spacer></v-spacer>
                  <span class="text-caption text-medium-emphasis">{{ formatDate(resource.createdAt) }}</span>
                </div>

                <h3 class="text-subtitle-1 font-weight-medium resource-title mb-1">{{ resource.name }}</h3>
                <p v-if="resource.description" class="text-body-2 resource-description">{{ resource.description }}</p>

                <!-- 标签 -->
                <div v-if="resource.labels && resource.labels.length > 0" class="resource-tags mt-2">
                  <v-chip
                    v-for="tag in resource.labels.slice(0, 3)"
                    :key="tag"
                    size="x-small"
                    variant="tonal"
                    class="mr-1 mb-1"
                  >
                    {{ tag }}
                  </v-chip>
                  <v-chip v-if="resource.labels.length > 3" size="x-small" variant="tonal" class="mb-1">
                    +{{ resource.labels.length - 3 }}
                  </v-chip>
                </div>
              </v-card-text>

              <!-- 底部信息 -->
              <v-card-actions class="pa-4 pt-0">
                <v-avatar size="24" color="grey-lighten-2">
                  <v-img :src="getAvatarUrl(resource.creator.avatarId)"></v-img>
                </v-avatar>
                <span class="text-caption ml-2">{{ resource.creator.nickname }}</span>
                <v-spacer></v-spacer>
                <v-btn
                  variant="text"
                  size="small"
                  density="comfortable"
                  icon="mdi-open-in-new"
                  @click.stop="openResourceLink(resource)"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>

      <!-- 列表视图 -->
      <v-table v-else class="resource-table rounded-lg">
        <thead>
          <tr>
            <th>资料名称</th>
            <th>类型</th>
            <th>添加者</th>
            <th>添加时间</th>
            <th>标签</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="resource in knowledges"
            :key="resource.id"
            class="resource-row"
            @click="openResourceDetail(resource)"
          >
            <td>
              <div class="d-flex align-center">
                <v-icon
                  :icon="getResourceIcon(resource.type, resource.material?.type)"
                  size="20"
                  class="mr-3 resource-type-icon"
                ></v-icon>
                <div>
                  <div class="font-weight-medium resource-title">{{ resource.name }}</div>
                  <div v-if="resource.description" class="text-caption text-medium-emphasis resource-description-list">
                    {{ resource.description }}
                  </div>
                </div>
              </div>
            </td>
            <td>{{ getResourceTypeName(resource.type, resource.material?.type) }}</td>
            <td>
              <div class="d-flex align-center">
                <v-avatar size="24" color="grey-lighten-2" class="mr-2">
                  <v-img :src="getAvatarUrl(resource.creator.avatarId)"></v-img>
                </v-avatar>
                <span>{{ resource.creator.nickname }}</span>
              </div>
            </td>
            <td>{{ formatDate(resource.createdAt) }}</td>
            <td>
              <div class="resource-tags">
                <v-chip
                  v-for="tag in resource.labels ? resource.labels.slice(0, 2) : []"
                  :key="tag"
                  size="x-small"
                  variant="tonal"
                  class="mr-1"
                >
                  {{ tag }}
                </v-chip>
                <v-chip v-if="resource.labels && resource.labels.length > 2" size="x-small" variant="tonal">
                  +{{ resource.labels.length - 2 }}
                </v-chip>
              </div>
            </td>
            <td>
              <div class="d-flex">
                <v-btn
                  variant="text"
                  size="small"
                  density="comfortable"
                  icon="mdi-eye"
                  @click.stop="openResourceDetail(resource)"
                ></v-btn>
                <v-btn
                  variant="text"
                  size="small"
                  density="comfortable"
                  icon="mdi-open-in-new"
                  @click.stop="openResourceLink(resource)"
                ></v-btn>
                <v-btn
                  v-if="canEditResource(resource)"
                  variant="text"
                  size="small"
                  density="comfortable"
                  icon="mdi-delete"
                  color="error"
                  @click.stop="confirmDeleteResource(resource)"
                ></v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- 资料详情对话框 -->
    <v-dialog v-model="resourceDetailDialog" max-width="700">
      <v-card v-if="selectedResource" class="resource-detail-card">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <div>{{ selectedResource.name }}</div>
          <v-btn icon="mdi-close" variant="text" @click="resourceDetailDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text class="pa-4">
          <!-- 资料预览 -->
          <div class="resource-full-preview mb-4">
            <!-- 图片预览 -->
            <v-img
              v-if="selectedResource.type === 'MATERIAL' && selectedResource.material?.type === 'image'"
              :src="selectedResource.material.url"
              :width="(selectedResource.material.meta as ImageMeta).width"
              :height="(selectedResource.material.meta as ImageMeta).height"
              max-height="400"
              class="mx-auto resource-image"
              contain
            ></v-img>

            <!-- 视频预览 -->
            <video
              v-else-if="selectedResource.type === 'MATERIAL' && selectedResource.material?.type === 'video'"
              controls
              class="mx-auto resource-video"
              max-height="400"
              max-width="100%"
            >
              <source :src="selectedResource.material.url" />
              您的浏览器不支持视频播放
            </video>

            <!-- 音频预览 -->
            <audio
              v-else-if="selectedResource.type === 'MATERIAL' && selectedResource.material?.type === 'audio'"
              controls
              class="mx-auto resource-audio d-block my-4"
              style="width: 100%"
            >
              <source :src="selectedResource.material.url" />
              您的浏览器不支持音频播放
            </audio>

            <!-- 文档预览 -->
            <v-sheet
              v-else-if="selectedResource.type === 'MATERIAL' && selectedResource.material?.type === 'file'"
              color="grey-lighten-4"
              class="pa-4 document-preview rounded-lg"
            >
              <v-icon
                :icon="getResourceIcon(selectedResource.type, selectedResource.material.type)"
                size="48"
                class="mb-2 d-block mx-auto"
              ></v-icon>
              <div class="text-center">
                <div class="text-body-2 mb-2">
                  {{ (selectedResource.material.meta as FileMeta).name || '该文档需要在外部程序中查看' }}
                </div>
                <div class="text-caption text-medium-emphasis mb-3">
                  {{ formatFileSize((selectedResource.material.meta as FileMeta).size) }}
                </div>
                <v-btn color="primary" size="small" @click="openResourceLink(selectedResource)"> 打开文档 </v-btn>
              </div>
            </v-sheet>

            <!-- 富文本内容预览 -->
            <v-sheet
              v-else-if="selectedResource.type === 'TEXT' && selectedResourceContent.richText"
              class="pa-4 text-preview rounded-lg"
            >
              <div class="rich-text-preview">
                <!-- 这里应该渲染富文本内容，可以用TipTap的只读模式 -->
                <TipTapEditor v-model="selectedResourceContent.richText" hide-toolbar output="json" :min-height="150" />
              </div>
            </v-sheet>

            <!-- 链接预览 -->
            <v-sheet
              v-else-if="selectedResource.type === 'LINK'"
              color="grey-lighten-4"
              class="pa-4 link-preview rounded-lg"
            >
              <div class="d-flex flex-column flex-md-row">
                <v-img
                  v-if="selectedResource.thumbnail"
                  :src="selectedResource.thumbnail"
                  height="80"
                  width="120"
                  class="rounded-lg mr-4 mb-3 mb-md-0"
                  cover
                ></v-img>
                <div>
                  <h3 class="text-h6 mb-1">{{ selectedResourceContent.title || selectedResource.name }}</h3>
                  <p class="text-body-2 mb-2">
                    {{ selectedResourceContent.description || selectedResource.description }}
                  </p>
                  <div class="text-caption text-medium-emphasis mb-3 text-truncate">
                    {{ selectedResourceContent.url }}
                  </div>
                  <v-btn color="primary" size="small" @click="openResourceLink(selectedResource)"> 访问链接 </v-btn>
                </div>
              </div>
            </v-sheet>

            <!-- 代码片段预览 -->
            <v-sheet
              v-else-if="selectedResource.type === 'CODE'"
              color="grey-lighten-4"
              class="pa-4 code-preview rounded-lg"
            >
              <div class="d-flex align-center mb-2">
                <div class="text-subtitle-1 font-weight-medium">代码片段</div>
                <v-chip v-if="selectedResourceContent.language" class="ml-2" size="small" variant="tonal">
                  {{ selectedResourceContent.language }}
                </v-chip>
              </div>
              <v-sheet color="grey-darken-4" class="pa-4 rounded-lg code-block">
                <pre
                  class="language-{{ selectedResourceContent.language || 'javascript' }}"
                ><code>{{ selectedResourceContent.code }}</code></pre>
              </v-sheet>
            </v-sheet>

            <div v-else class="text-center py-4">
              <v-icon
                :icon="getResourceIcon(selectedResource.type, selectedResource.material?.type)"
                size="64"
              ></v-icon>
              <div class="mt-2 text-body-2">此类型的资料没有预览</div>
            </div>
          </div>

          <!-- 资料信息 -->
          <v-sheet color="grey-lighten-4" rounded="lg" class="pa-4 mb-4">
            <div class="text-subtitle-1 font-weight-medium mb-2">资料信息</div>
            <div class="d-flex resource-info-row">
              <div class="resource-info-label">类型</div>
              <div>{{ getResourceTypeName(selectedResource.type, selectedResource.material?.type) }}</div>
            </div>
            <div v-if="selectedResource.material?.type === 'file'" class="d-flex resource-info-row">
              <div class="resource-info-label">文件名</div>
              <div>{{ (selectedResource.material.meta as FileMeta).name }}</div>
            </div>
            <div v-if="selectedResource.material" class="d-flex resource-info-row">
              <div class="resource-info-label">大小</div>
              <div>{{ formatFileSize(selectedResource.material.meta.size) }}</div>
            </div>
            <div
              v-if="selectedResource.material?.type === 'video' || selectedResource.material?.type === 'audio'"
              class="d-flex resource-info-row"
            >
              <div class="resource-info-label">时长</div>
              <div>{{ formatDuration((selectedResource.material.meta as VideoMeta | AudioMeta).duration) }}</div>
            </div>
            <div class="d-flex resource-info-row">
              <div class="resource-info-label">添加者</div>
              <div class="d-flex align-center">
                <v-avatar size="24" color="grey-lighten-2" class="mr-2">
                  <v-img :src="getAvatarUrl(selectedResource.creator.avatarId)"></v-img>
                </v-avatar>
                <span>{{ selectedResource.creator.nickname }}</span>
              </div>
            </div>
            <div class="d-flex resource-info-row">
              <div class="resource-info-label">添加时间</div>
              <div>{{ formatDetailDate(selectedResource.createdAt) }}</div>
            </div>
            <div class="d-flex resource-info-row">
              <div class="resource-info-label">来源频道</div>
              <div>{{ selectedResource.sourceChannel?.name || '未知频道' }}</div>
            </div>
            <div v-if="selectedResource.description" class="d-flex resource-info-row">
              <div class="resource-info-label">描述</div>
              <div>{{ selectedResource.description }}</div>
            </div>
            <div v-if="selectedResource.labels && selectedResource.labels.length > 0" class="d-flex resource-info-row">
              <div class="resource-info-label">标签</div>
              <div class="d-flex flex-wrap">
                <v-chip
                  v-for="tag in selectedResource.labels"
                  :key="tag"
                  size="small"
                  variant="tonal"
                  class="mr-1 mb-1"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </div>
          </v-sheet>

          <!-- 原始讨论上下文 -->
          <v-sheet color="grey-lighten-4" rounded="lg" class="pa-4">
            <div class="text-subtitle-1 font-weight-medium mb-2">原始讨论</div>
            <div v-if="selectedResource.originalMessage" class="original-message-context">
              <div class="d-flex">
                <v-avatar size="36" color="grey-lighten-2" class="mt-1">
                  <v-img :src="getAvatarUrl(selectedResource.originalMessage.sender.avatarId)"></v-img>
                </v-avatar>
                <div class="ml-3">
                  <div class="d-flex align-center">
                    <span class="font-weight-medium">{{ selectedResource.originalMessage.sender.nickname }}</span>
                    <span class="text-caption text-medium-emphasis ml-2">
                      {{ formatMessageTime(selectedResource.originalMessage.createdAt) }}
                    </span>
                  </div>
                  <p class="text-body-2 mt-1">{{ selectedResource.originalMessage.content }}</p>
                </div>
              </div>
              <div class="d-flex justify-end mt-2">
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  :to="{
                    name: 'TeamsDetailChannels',
                    params: { teamId: teamId },
                    query: { channelId: selectedResource.sourceChannel?.id },
                  }"
                  @click="resourceDetailDialog = false"
                >
                  <v-icon start size="small">mdi-arrow-right</v-icon>
                  跳转到原始讨论
                </v-btn>
              </div>
            </div>
            <div v-else class="text-center py-4 text-body-2 text-medium-emphasis">没有关联的原始讨论信息</div>
          </v-sheet>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            v-if="canEditResource(selectedResource)"
            color="error"
            variant="text"
            @click="confirmDeleteResource(selectedResource)"
          >
            删除资料
          </v-btn>
          <v-btn color="primary" variant="tonal" @click="openResourceLink(selectedResource)">
            <v-icon start>mdi-open-in-new</v-icon>
            打开资料
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 添加上传对话框 -->
    <v-dialog v-model="uploadDialog" max-width="600">
      <v-card rounded="lg" class="upload-dialog">
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <div class="text-h6 font-weight-medium">添加资料</div>
          <v-btn icon="mdi-close" variant="text" @click="uploadDialog = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-4 pt-2">
          <v-form ref="uploadForm" @submit.prevent="submitUpload">
            <!-- 资料名称 -->
            <v-text-field
              v-model="uploadData.name"
              label="资料名称"
              variant="outlined"
              hide-details="auto"
              class="mb-4"
              density="comfortable"
              :rules="[(v) => !!v || '请输入资料名称']"
            ></v-text-field>

            <div class="type-selector mb-5">
              <label class="text-body-2 text-medium-emphasis mb-3 d-block">资料类型</label>

              <div class="type-options">
                <div
                  v-for="type in typeOptions"
                  :key="type.value"
                  class="type-option"
                  :class="{ 'type-option-active': uploadData.type === type.value }"
                  @click="handleTypeChange(type.value as KnowledgeType)"
                >
                  <div class="type-icon-wrapper">
                    <v-icon :icon="getTypeIcon(type.value as KnowledgeType)" size="18"></v-icon>
                  </div>
                  <div class="type-label">{{ type.text }}</div>
                </div>
              </div>
            </div>

            <div class="content-area">
              <!-- 文件上传区 -->
              <div v-if="uploadData.type === 'MATERIAL'" class="upload-content">
                <v-file-input
                  v-model="uploadData.file"
                  label="选择文件"
                  variant="outlined"
                  density="comfortable"
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/*,audio/*"
                  :rules="[(v) => !!v || '请选择文件']"
                  hide-details="auto"
                  class="mb-4"
                  show-size
                  chips
                  prepend-icon=""
                >
                  <template #prepend>
                    <v-icon color="primary" class="mr-2">mdi-file-upload-outline</v-icon>
                  </template>
                </v-file-input>

                <div v-if="uploadData.file" class="file-preview py-2">
                  <v-img
                    v-if="isImageFile(uploadData.file)"
                    :src="getFilePreviewUrl(uploadData.file)"
                    height="120"
                    width="100%"
                    class="rounded-lg mb-2"
                    cover
                  ></v-img>
                  <div v-else class="d-flex align-center justify-center py-3 grey-lighten-5 rounded-lg">
                    <v-icon :icon="getFileTypeIcon(uploadData.file)" size="36" color="primary" class="mr-2"></v-icon>
                    <span class="text-body-2">{{ uploadData.file.name }}</span>
                  </div>
                </div>
              </div>

              <!-- 富文本编辑区 -->
              <div v-else-if="uploadData.type === 'TEXT'" class="upload-content">
                <div class="mb-3">
                  <TipTapEditor v-model="uploadData.richTextContent" output="json" :min-height="180" />
                </div>
              </div>

              <!-- 链接添加区 -->
              <div v-else-if="uploadData.type === 'LINK'" class="upload-content">
                <v-text-field
                  v-model="uploadData.url"
                  label="链接地址"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  class="mb-4"
                  :rules="[(v) => !!v || '请输入链接地址', (v) => /^https?:\/\//.test(v) || '请输入有效的URL']"
                  placeholder="https://"
                  prepend-inner-icon="mdi-link"
                ></v-text-field>
                <v-text-field
                  v-model="uploadData.title"
                  label="链接标题（可选）"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  placeholder="如果留空，将使用资料名称"
                ></v-text-field>
              </div>

              <!-- 代码片段区 -->
              <div v-else-if="uploadData.type === 'CODE'" class="upload-content">
                <v-select
                  v-model="uploadData.language"
                  label="编程语言"
                  :items="languageOptions"
                  item-title="text"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  prepend-inner-icon="mdi-code-tags"
                  class="mb-3"
                ></v-select>
                <v-textarea
                  v-model="uploadData.code"
                  label="代码内容"
                  variant="outlined"
                  density="comfortable"
                  :rules="[(v) => !!v || '请输入代码内容']"
                  rows="6"
                  hide-details="auto"
                  placeholder="在此处粘贴代码..."
                  class="code-textarea"
                  color="primary"
                ></v-textarea>
              </div>
            </div>

            <!-- 附加信息区 -->
            <div class="additional-info mt-4">
              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-information-outline" size="small" class="mr-2"></v-icon>
                      附加信息
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-textarea
                      v-model="uploadData.description"
                      label="资料描述"
                      variant="outlined"
                      density="comfortable"
                      rows="2"
                      hide-details="auto"
                      class="mb-3"
                      placeholder="简要描述此资料的内容和用途"
                    ></v-textarea>

                    <v-combobox
                      v-model="uploadData.labels"
                      label="标签"
                      variant="outlined"
                      density="comfortable"
                      multiple
                      chips
                      closable-chips
                      hide-details="auto"
                      :items="availableTags"
                      placeholder="添加标签，便于分类和查找"
                    ></v-combobox>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="uploadDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="uploading" :disabled="uploading" @click="submitUpload">上传</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import type { JSONContent } from 'vuetify-pro-tiptap'
import type { CreateKnowledgeRequest, Knowledge, KnowledgeType } from '@/types'
import type { AudioMeta, FileMeta, ImageMeta, Material, MaterialType, VideoMeta } from '@/types/materials'

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { toast } from 'vuetify-sonner'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

import TipTapEditor from '@/components/common/Editor/TipTapEditor.vue'
import { KnowledgesApi } from '@/network/api/knowledges'
import { MaterialsApi } from '@/network/api/materials'
import { useDialog } from '@/plugins/dialog'
import { currentUserId } from '@/services/account'
import { parseKnowledgeContent, stringifyKnowledgeContent } from '@/types'
import { KnowledgeContentData } from '@/types'

// 状态
const route = useRoute()
const dialog = useDialog()
const teamId = computed(() => Number(route.params.teamId))
const loading = ref(true)
const viewMode = ref('grid')
const searchQuery = ref('')
const knowledges = ref<Knowledge[]>([])
const page = ref({
  pageStart: undefined as number | undefined,
  pageSize: 20,
  hasMore: false,
  nextStart: 0,
  total: 0,
})
const resourceDetailDialog = ref(false)
const selectedResource = ref<Knowledge | null>(null)

// 筛选器
const filter = ref({
  type: null as string | null,
  tag: null as string | null,
})

// 计算是否有筛选条件
const hasFilters = computed(() => {
  return !!(searchQuery.value || filter.value.type || filter.value.tag)
})

// 资源类型选项
const resourceTypes = ['文本', '文件', '链接', '代码片段']

// 获取可用标签列表
const availableTags = computed(() => {
  const tags = new Set<string>()
  knowledges.value.forEach((resource) => {
    if (resource.labels && resource.labels.length) {
      resource.labels.forEach((tag: string) => tags.add(tag))
    }
  })
  return Array.from(tags)
})

// 上传相关状态
const uploadDialog = ref(false)
const uploadTab = ref('file')
const uploading = ref(false)
const uploadForm = ref<InstanceType<typeof VForm>>()

const typeOptions = [
  { text: '文件', value: 'MATERIAL' as KnowledgeType },
  { text: '文本', value: 'TEXT' as KnowledgeType },
  { text: '链接', value: 'LINK' as KnowledgeType },
  { text: '代码片段', value: 'CODE' as KnowledgeType },
]

const uploadData = ref({
  name: '',
  description: '',
  type: 'MATERIAL' as KnowledgeType,
  labels: [] as string[],
  file: null as File | null,
  materialType: 'file' as MaterialType,
  richTextContent: {} as JSONContent,
  url: '',
  title: '',
  code: '',
  language: 'javascript',
})

// 编程语言选项
const languageOptions = [
  { text: 'JavaScript', value: 'javascript' },
  { text: 'TypeScript', value: 'typescript' },
  { text: 'HTML', value: 'html' },
  { text: 'CSS', value: 'css' },
  { text: 'Python', value: 'python' },
  { text: 'Java', value: 'java' },
  { text: 'C/C++', value: 'cpp' },
  { text: 'Go', value: 'go' },
  { text: 'Ruby', value: 'ruby' },
  { text: 'PHP', value: 'php' },
  { text: 'Shell', value: 'shell' },
  { text: '其他', value: 'plaintext' },
]

// 存储选中资源的解析后内容
const selectedResourceContent = ref<KnowledgeContentData>({})

// 监听路由参数变化
watch(
  () => teamId.value,
  () => {
    loadKnowledges()
  }
)

// 加载知识库资源
const loadKnowledges = async () => {
  try {
    loading.value = true

    const params: any = {
      teamId: teamId.value,
      pageSize: 20,
      sort_by: 'createdAt',
      sort_order: 'desc',
    }

    // 添加搜索参数
    if (searchQuery.value) {
      params.query = searchQuery.value
    }

    // 添加类型筛选
    if (filter.value.type) {
      params.type = getResourceTypeCode(filter.value.type)
    }

    // 添加标签筛选
    if (filter.value.tag) {
      params.labels = [filter.value.tag]
    }

    const { knowledges: fetchedKnowledges, page: fetchedPage } = await KnowledgesApi.list(params).then(
      (res) => res.data
    )

    knowledges.value = fetchedKnowledges
    page.value = {
      pageStart: fetchedPage.pageStart,
      pageSize: fetchedPage.pageSize,
      hasMore: fetchedPage.hasMore,
      nextStart: fetchedPage.nextStart,
      total: fetchedPage.total || 0,
    }
  } catch (error) {
    console.error('获取知识库资源失败', error)
    knowledges.value = []
  } finally {
    loading.value = false
  }
}

// 打开资源详情
const openResourceDetail = (resource: Knowledge) => {
  selectedResource.value = resource
  selectedResourceContent.value = parseKnowledgeContent(resource)
  resourceDetailDialog.value = true
}

// 获取资源类型代码
const getResourceTypeCode = (typeName: string): KnowledgeType => {
  switch (typeName) {
    case '文件':
      return 'MATERIAL'
    case '文本':
      return 'TEXT'
    case '链接':
      return 'LINK'
    case '代码片段':
      return 'CODE'
    default:
      return 'TEXT'
  }
}

// 打开资源链接
const openResourceLink = (resource: Knowledge) => {
  const contentData = parseKnowledgeContent(resource)
  if (resource.type === 'LINK' && contentData.url) {
    window.open(contentData.url, '_blank')
  } else if (resource.material?.url) {
    window.open(resource.material.url, '_blank')
  } else if (resource.url) {
    window.open(resource.url, '_blank')
  }
}

// 确认删除资源
const confirmDeleteResource = async (resource: Knowledge) => {
  const result = await dialog
    .confirm(`确定要删除资源"${resource.name}"吗？此操作不可撤销。`, {
      title: '删除资源',
    })
    .wait()

  if (result) {
    try {
      await KnowledgesApi.deleteKnowledge(resource.id)

      // 从本地列表中移除
      knowledges.value = knowledges.value.filter((r) => r.id !== resource.id)

      if (resourceDetailDialog.value) {
        resourceDetailDialog.value = false
      }
    } catch (error) {
      console.error('删除资源失败', error)
      dialog.alert('删除资源失败，请稍后重试。')
    }
  }
}

// 判断当前用户是否可以编辑资源
const canEditResource = (resource: Knowledge) => {
  // 资源创建者或小队管理员可以编辑
  return resource.creator.id === currentUserId.value
}

// 获取资源类型图标
const getResourceIcon = (type: KnowledgeType, materialType?: MaterialType) => {
  if (type === 'MATERIAL') {
    switch (materialType) {
      case 'file':
        return 'mdi-file-document'
      case 'image':
        return 'mdi-file-image'
      case 'video':
        return 'mdi-file-video'
      case 'audio':
        return 'mdi-file-music'
      default:
        return 'mdi-file'
    }
  }

  switch (type) {
    case 'TEXT':
      return 'mdi-text-box'
    case 'LINK':
      return 'mdi-link'
    case 'CODE':
      return 'mdi-code-braces'
    default:
      return 'mdi-file'
  }
}

// 获取资源类型名称
const getResourceTypeName = (type: KnowledgeType, materialType?: MaterialType) => {
  if (type === 'MATERIAL') {
    switch (materialType) {
      case 'file':
        return '文档'
      case 'image':
        return '图片'
      case 'video':
        return '视频'
      case 'audio':
        return '音频'
      default:
        return '文件'
    }
  }

  switch (type) {
    case 'TEXT':
      return '文本'
    case 'LINK':
      return '链接'
    case 'CODE':
      return '代码片段'
    default:
      return '未知类型'
  }
}

// 格式化日期
const formatDate = (timestamp: number) => {
  return dayjs(timestamp).format('MM/DD')
}

// 格式化详细日期
const formatDetailDate = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY年MM月DD日 HH:mm')
}

// 格式化消息时间
const formatMessageTime = (timestamp: number) => {
  const now = dayjs()
  const messageTime = dayjs(timestamp)

  if (now.diff(messageTime, 'day') === 0) {
    // 今天
    return messageTime.format('HH:mm')
  } else if (now.diff(messageTime, 'day') === 1) {
    // 昨天
    return `昨天 ${messageTime.format('HH:mm')}`
  } else if (now.diff(messageTime, 'day') < 7) {
    // 本周
    return messageTime.format('ddd HH:mm')
  } else {
    // 更久以前
    return messageTime.format('MM-DD HH:mm')
  }
}

// 打开上传对话框
const openUploadDialog = () => {
  resetUploadForm()
  uploadDialog.value = true
}

// 重置上传表单
const resetUploadForm = () => {
  uploadData.value = {
    name: '',
    description: '',
    type: 'MATERIAL',
    labels: [],
    file: null,
    materialType: 'file',
    richTextContent: {},
    url: '',
    title: '',
    code: '',
    language: 'javascript',
  }
  uploadTab.value = 'file'

  // 重置表单验证
  if (uploadForm.value) {
    uploadForm.value.resetValidation()
  }
}

// 提交上传
const submitUpload = async () => {
  // 验证表单
  if (!uploadForm.value || !(await uploadForm.value.validate()).valid) {
    return
  }

  // 根据当前选择的类型检查必要字段
  if (uploadData.value.type === 'MATERIAL' && !uploadData.value.file) {
    toast.error('请选择要上传的文件')
    return
  } else if (uploadData.value.type === 'LINK' && !uploadData.value.url) {
    toast.error('请输入有效的链接地址')
    return
  } else if (uploadData.value.type === 'CODE' && !uploadData.value.code) {
    toast.error('请输入代码内容')
    return
  }

  uploading.value = true

  try {
    let materialId: number | undefined
    let contentData: KnowledgeContentData = {}

    // 处理不同类型的上传
    if (uploadData.value.type === 'MATERIAL' && uploadData.value.file) {
      // 确定文件类型
      const fileType = uploadData.value.file.type.startsWith('image/')
        ? 'image'
        : uploadData.value.file.type.startsWith('video/')
          ? 'video'
          : uploadData.value.file.type.startsWith('audio/')
            ? 'audio'
            : 'file'

      // 文件上传
      const res = await MaterialsApi.upload(uploadData.value.file, fileType)
      materialId = res.data.id

      // 设置 MATERIAL 类型的富文本内容
      contentData.richText = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: uploadData.value.file.name,
              },
            ],
          },
        ],
      }
    } else if (uploadData.value.type === 'TEXT') {
      // 文本类型
      contentData.richText = uploadData.value.richTextContent
    } else if (uploadData.value.type === 'LINK') {
      // 链接类型
      contentData.url = uploadData.value.url
      contentData.title = uploadData.value.title || uploadData.value.name
      contentData.description = uploadData.value.description
    } else if (uploadData.value.type === 'CODE') {
      // 代码片段
      contentData.code = uploadData.value.code
      contentData.language = uploadData.value.language
    }

    // 创建知识库条目
    const knowledgeData: CreateKnowledgeRequest = {
      name: uploadData.value.name,
      description: uploadData.value.description,
      type: uploadData.value.type,
      content: stringifyKnowledgeContent(contentData),
      teamId: teamId.value,
      labels: uploadData.value.labels,
    }

    if (materialId) {
      knowledgeData.materialId = materialId
    }

    const response = await KnowledgesApi.create(knowledgeData)

    // 添加新创建的知识条目到列表
    knowledges.value = [response.data.knowledge, ...knowledges.value]

    // 关闭对话框并重置表单
    uploadDialog.value = false
    resetUploadForm()

    toast.success('资料上传成功')
  } catch (error) {
    console.error('上传资料失败', error)
    toast.error('上传资料失败，请稍后重试')
  } finally {
    uploading.value = false
  }
}

// 辅助函数：格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
}

// 辅助函数：格式化时长
const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 辅助函数：获取缩略图
const getMaterialThumbnail = (material?: Material) => {
  if (!material) return null

  if (material.type === 'image' || material.type === 'video') {
    return (material.meta as ImageMeta | VideoMeta).thumbnail
  }

  return null
}

// 获取资源类型图标
const getTypeIcon = (type: KnowledgeType) => {
  switch (type) {
    case 'MATERIAL':
      return 'mdi-file-document-outline'
    case 'TEXT':
      return 'mdi-text-box-outline'
    case 'LINK':
      return 'mdi-link'
    case 'CODE':
      return 'mdi-code-braces'
    default:
      return 'mdi-file'
  }
}

// 处理资料类型变更
const handleTypeChange = (type: KnowledgeType) => {
  uploadData.value.type = type
}

// 获取文件上传标签
const getFileUploadLabel = () => {
  return '选择要上传的文件（图片、文档、视频、音频等）'
}

// 判断是否为图片文件
const isImageFile = (file: File) => {
  return file.type.startsWith('image/')
}

// 获取文件类型图标
const getFileTypeIcon = (file: File) => {
  if (file.type.startsWith('image/')) {
    return 'mdi-file-image-outline'
  } else if (file.type.startsWith('video/')) {
    return 'mdi-file-video-outline'
  } else if (file.type.startsWith('audio/')) {
    return 'mdi-file-music-outline'
  } else if (file.type.includes('pdf')) {
    return 'mdi-file-pdf-outline'
  } else if (file.type.includes('word') || file.type.includes('document')) {
    return 'mdi-file-word-outline'
  } else {
    return 'mdi-file-outline'
  }
}

// 获取文件预览URL
const getFilePreviewUrl = (file: File) => {
  return URL.createObjectURL(file)
}

onMounted(async () => {
  await loadKnowledges()
})
</script>

<style scoped lang="scss">
.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.knowledge-search {
  min-width: 280px;
  max-width: 500px;
}

.resource-type-filter,
.tag-filter {
  min-width: 140px;
}

.empty-knowledge-state {
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.01);
}

.resource-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;

  &.card-hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.resource-preview {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.03);

  &.resource-type-material {
    background-color: rgba(63, 81, 181, 0.08);
  }

  &.resource-type-text {
    background-color: rgba(76, 175, 80, 0.08);
  }

  &.resource-type-link {
    background-color: rgba(255, 152, 0, 0.08);
  }

  &.resource-type-code {
    background-color: rgba(3, 169, 244, 0.08);
  }
}

.resource-icon {
  opacity: 0.6;
}

.resource-thumbnail {
  width: 100%;
  height: 100%;
}

.resource-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.resource-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.4;
  min-height: 2.8em;
}

.resource-description-list {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}

.resource-type-icon {
  flex-shrink: 0;
}

.resource-table {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.resource-row {
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
}

.resource-info-row {
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.resource-info-label {
  min-width: 80px;
  color: rgba(0, 0, 0, 0.6);
  margin-right: 16px;
}

.document-preview,
.link-preview {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.code-block {
  overflow-x: auto;
  color: #e0e0e0;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;

  pre {
    margin: 0;
  }
}

.rich-text-preview :deep(.tiptap-editor) {
  background-color: transparent;
  padding: 0;

  .ProseMirror {
    padding: 0;
    min-height: auto !important;
  }
}

.resource-video,
.resource-audio {
  max-width: 100%;
}

// 响应式调整
@media (max-width: 600px) {
  .knowledge-search {
    width: 100%;
  }

  .resource-description-list {
    max-width: 150px;
  }
}

// 上传对话框样式
.upload-dialog {
  overflow: hidden;
}

.type-selector {
  margin-bottom: 24px;
}

.type-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.type-option {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px solid transparent;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
    transform: translateY(-2px);
  }

  &.type-option-active {
    background-color: rgba(var(--v-theme-primary), 0.08);
    border-color: rgba(var(--v-theme-primary), 0.2);

    .type-icon-wrapper {
      background-color: rgb(var(--v-theme-primary));
      color: white;
    }

    .type-label {
      color: rgb(var(--v-theme-primary));
      font-weight: 500;
    }
  }
}

.type-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.type-label {
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

// 响应式调整
@media (max-width: 600px) {
  .type-options {
    grid-template-columns: repeat(2, 1fr);
  }
}

.upload-content {
  padding: 0;
  border-radius: 8px;
  min-height: 120px;
}

.file-preview {
  border-radius: 8px;
  overflow: hidden;
}

.code-textarea :deep(textarea) {
  font-family: 'Fira Code', monospace !important;
  font-size: 14px;
  line-height: 1.5;
}
</style>
