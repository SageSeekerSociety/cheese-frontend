<template>
  <v-sheet flat rounded="lg">
    <v-toolbar :title="t('spaces.detail.manageCategories.title')" color="transparent" density="compact">
      <template #append>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          {{ t('spaces.detail.manageCategories.addCategory') }}
        </v-btn>
      </template>
    </v-toolbar>

    <div v-if="loadingCategories" class="pa-4 text-center">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <v-list v-else-if="categories.length > 0" rounded="lg">
      <v-list-item
        v-for="category in categories"
        :key="category.id"
        :title="
          category.name +
          (currentSpace?.defaultCategoryId === category.id ? ' ' + t('spaces.detail.manageCategories.isDefault') : '')
        "
        :subtitle="category.description || undefined"
      >
        <template #prepend>
          <v-avatar color="primary-lighten-5" size="42" class="me-3">
            <v-icon color="primary">{{ category.archivedAt ? 'mdi-archive' : 'mdi-shape' }}</v-icon>
          </v-avatar>
        </template>
        <template #append>
          <v-tooltip v-if="!category.archivedAt && currentSpace?.defaultCategoryId !== category.id" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-star-outline"
                variant="text"
                color="warning"
                @click="setAsDefault(category.id)"
              ></v-btn>
            </template>
            {{ t('spaces.detail.manageCategories.setAsDefault') }}
          </v-tooltip>

          <v-btn v-if="!category.archivedAt" icon="mdi-pencil" variant="text" @click="openEditDialog(category)"></v-btn>

          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
            </template>
            <v-list density="compact">
              <v-list-item v-if="category.archivedAt" @click="unarchiveCategory(category.id)">
                <template #prepend>
                  <v-icon color="success">mdi-archive-arrow-up</v-icon>
                </template>
                <v-list-item-title>{{ t('spaces.detail.manageCategories.unarchiveCategory') }}</v-list-item-title>
              </v-list-item>

              <v-list-item v-else @click="archiveCategory(category.id)">
                <template #prepend>
                  <v-icon color="warning">mdi-archive-arrow-down</v-icon>
                </template>
                <v-list-item-title>{{ t('spaces.detail.manageCategories.archiveCategory') }}</v-list-item-title>
              </v-list-item>

              <v-list-item @click="deleteCategory(category.id)">
                <template #prepend>
                  <v-icon color="error">mdi-delete</v-icon>
                </template>
                <v-list-item-title>{{ t('spaces.detail.manageCategories.deleteCategory') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-list-item>
    </v-list>

    <v-sheet v-else class="pa-4 text-center">
      <p class="text-medium-emphasis">{{ t('spaces.detail.manageCategories.noCategories') }}</p>
    </v-sheet>

    <!-- 创建/编辑分类对话框 -->
    <v-dialog v-model="dialogOpen" max-width="500">
      <v-card>
        <v-card-title>
          {{
            editingCategory
              ? t('spaces.detail.manageCategories.updateCategory')
              : t('spaces.detail.manageCategories.createCategory')
          }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="submitForm">
            <v-text-field
              v-model="formData.name"
              :label="t('spaces.detail.manageCategories.name')"
              required
              v-bind="nameProps"
            ></v-text-field>

            <v-textarea
              v-model="formData.description"
              :label="t('spaces.detail.manageCategories.description')"
              v-bind="descriptionProps"
              rows="3"
              auto-grow
            ></v-textarea>

            <v-text-field
              v-model.number="formData.displayOrder"
              :label="t('spaces.detail.manageCategories.displayOrder')"
              type="number"
              min="0"
              hint="越小越靠前显示"
              v-bind="displayOrderProps"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialogOpen = false">{{ t('spaces.detail.manageCategories.cancel') }}</v-btn>
          <v-btn color="primary" :loading="isSubmitting" @click="submitForm">{{
            t('spaces.detail.manageCategories.confirm')
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-sheet>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toTypedSchema } from '@vee-validate/zod'
import { storeToRefs } from 'pinia'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { vuetifyConfig } from '@/utils/form'

import { useDialog } from '@/plugins/dialog'
import { useSpaceStore } from '@/stores/space'
import { SpaceCategory } from '@/types'

const spaceStore = useSpaceStore()
const { currentSpace, categories, loadingCategories } = storeToRefs(spaceStore)
const { t } = useI18n()
const { confirm } = useDialog()

// 表单相关
const dialogOpen = ref(false)
const editingCategory = ref<SpaceCategory | null>(null)

// 表单校验
const { handleSubmit, defineField, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      name: z
        .string()
        .min(1, { message: 'spaces.detail.manageCategories.categoryNameRequired' })
        .max(32, { message: 'spaces.detail.manageCategories.categoryNameMaxLength' }),
      description: z
        .string()
        .max(255, { message: 'spaces.detail.manageCategories.descriptionMaxLength' })
        .nullable()
        .optional(),
      displayOrder: z.number().int().nonnegative().optional(),
    })
  ),
})

const [name, nameProps] = defineField('name', vuetifyConfig)
const [description, descriptionProps] = defineField('description', vuetifyConfig)
const [displayOrder, displayOrderProps] = defineField('displayOrder', vuetifyConfig)

const formData = reactive({
  name,
  description,
  displayOrder: 0,
})

// 生命周期钩子
onMounted(async () => {
  await spaceStore.fetchCategories(true)
})

// 方法
const openCreateDialog = () => {
  resetForm({
    values: {
      name: '',
      description: '',
      displayOrder: 0,
    },
  })
  editingCategory.value = null
  dialogOpen.value = true
}

const openEditDialog = (category: SpaceCategory) => {
  resetForm({
    values: {
      name: category.name,
      description: category.description,
      displayOrder: category.displayOrder,
    },
  })
  editingCategory.value = category
  dialogOpen.value = true
}

const submitForm = handleSubmit(async (values) => {
  try {
    if (editingCategory.value) {
      await spaceStore.updateCategory(editingCategory.value.id, {
        name: values.name,
        description: values.description,
        displayOrder: values.displayOrder,
      })
    } else {
      await spaceStore.createCategory(values.name, values.description, values.displayOrder)
    }
    dialogOpen.value = false
  } catch (error) {
    console.error('提交表单失败:', error)
  }
})

const deleteCategory = async (categoryId: number) => {
  const confirmed = await confirm(t('spaces.detail.manageCategories.confirmDelete')).wait()
  if (!confirmed) return

  try {
    await spaceStore.deleteCategory(categoryId)
  } catch (error) {
    console.error('删除分类失败:', error)
  }
}

const archiveCategory = async (categoryId: number) => {
  const confirmed = await confirm(t('spaces.detail.manageCategories.confirmArchive')).wait()
  if (!confirmed) return

  try {
    await spaceStore.archiveCategory(categoryId)
  } catch (error) {
    console.error('归档分类失败:', error)
  }
}

const unarchiveCategory = async (categoryId: number) => {
  try {
    await spaceStore.unarchiveCategory(categoryId)
  } catch (error) {
    console.error('恢复分类失败:', error)
  }
}

const setAsDefault = async (categoryId: number) => {
  try {
    await spaceStore.setDefaultCategory(categoryId)
  } catch (error) {
    console.error('设置默认分类失败:', error)
  }
}
</script>

<style scoped>
.v-list-item {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
}
.v-list-item:last-child {
  border-bottom: none;
}
</style>
