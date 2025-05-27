<template>
  <div class="tax-center-app bg-gray-50 min-h-screen">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center">
                <BarChart3 class="h-8 w-8 text-blue-600" />
                <span class="ml-2 text-xl font-bold text-gray-900">台州数智强基平台</span>
              </div>
            </div>
          </div>
          <div class="flex items-center">
            <router-link
                to="/"
                class="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              返回首页
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="container mx-auto px-4 py-6">
      <div class="bg-white rounded-lg shadow">
        <!-- 页面标题 -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-900">公告栏</h1>
          <p class="text-sm text-gray-600 mt-1">查看所有系统公告和通知</p>
        </div>

        <!-- 公告列表 -->
        <div class="p-6">
          <div class="space-y-4">
            <div
                v-for="notice in paginatedNotices"
                :key="notice.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                @click="openNoticeDetail(notice)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <div :class="[
                      'h-2 w-2 rounded-full mr-3',
                      notice.read ? 'bg-gray-300' : 'bg-blue-500'
                    ]">
                    </div>
                    <h3 class="text-lg font-medium text-gray-900">{{ notice.title }}</h3>
                  </div>
                  <div class="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar class="h-4 w-4 mr-1" />
                    <span>{{ notice.time }}</span>
                    <User class="h-4 w-4 ml-4 mr-1" />
                    <span>{{ notice.author }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ getNoticePreview(notice.content) }}</p>
                </div>
                <div class="ml-4 flex-shrink-0">
                  <ChevronRight class="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <!-- 分页控件 -->
          <div class="flex justify-center mt-8">
            <nav class="flex items-center space-x-2">
              <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ChevronLeft class="h-5 w-5 mr-1" />
                上一页
              </button>

              <div class="flex space-x-1">
                <button
                    v-for="page in displayedPageNumbers"
                    :key="page"
                    @click="goToPage(page)"
                    :class="[
                    'px-3 py-2 rounded-md min-w-[40px]',
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  ]"
                >
                  {{ page }}
                </button>
              </div>

              <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                下一页
                <ChevronRight class="h-5 w-5 ml-1" />
              </button>
            </nav>
          </div>

          <!-- 分页信息 -->
          <div class="text-center mt-4 text-sm text-gray-500">
            共 {{ allNotices.length }} 条公告，第 {{ currentPage }} / {{ totalPages }} 页
          </div>
        </div>
      </div>
    </main>

    <!-- 公告详情模态框 -->
    <div v-if="showNoticeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto mx-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">公告详情</h2>
          <button @click="showNoticeModal = false" class="text-gray-500 hover:text-gray-700">
            <X class="h-5 w-5" />
          </button>
        </div>
        <div v-if="selectedNotice" class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ selectedNotice.title }}</h3>
          <div class="flex items-center text-sm text-gray-500 mb-4">
            <Calendar class="h-4 w-4 mr-1" />
            <span>{{ selectedNotice.time }}</span>
            <User class="h-4 w-4 ml-3 mr-1" />
            <span>{{ selectedNotice.author }}</span>
          </div>
          <div class="border-t border-gray-200 pt-4">
            <div class="prose prose-blue max-w-none text-gray-600" v-html="selectedNotice.content"></div>
          </div>
          <div v-if="selectedNotice.attachments && selectedNotice.attachments.length > 0" class="mt-6">
            <h4 class="font-medium text-gray-900 mb-2">附件</h4>
            <div class="space-y-2">
              <div
                  v-for="(attachment, index) in selectedNotice.attachments"
                  :key="index"
                  class="flex items-center p-2 border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <FileText class="h-5 w-5 text-blue-500 mr-2" />
                <button
                    @click="downloadAttachment(attachment)"
                    class="text-blue-600 hover:underline cursor-pointer flex-1 text-left"
                    :disabled="downloadingFiles.includes(attachment.filename)"
                >
                  {{ attachment.name }}
                  <span v-if="downloadingFiles.includes(attachment.filename)" class="ml-2 text-xs text-gray-500">(下载中...)</span>
                </button>
                <span class="ml-2 text-xs text-gray-500">({{ attachment.size }})</span>
                <Download class="h-4 w-4 text-gray-400 ml-2" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end">
          <button
              @click="markNoticeAsRead"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            标记为已读
          </button>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <footer class="bg-white border-t border-gray-200 mt-8">
      <div class="container mx-auto px-4 py-6">
        <div class="text-center text-gray-500 text-sm">
          <p>© 2025 台州市税务局 . 版权所有</p>
          <p class="mt-1">技术支持: 数智强基中心</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  X,
  FileText,
  Download
} from 'lucide-vue-next'
import { downloadFile } from '../api/fileService'

// 响应式数据
const showNoticeModal = ref(false)
const selectedNotice = ref(null)
const currentPage = ref(1)
const noticesPerPage = 20

// 下载状态跟踪
const downloadingFiles = ref([])

// 附件下载功能
const downloadAttachment = async (attachment) => {
  try {
    // 添加到下载中列表
    downloadingFiles.value.push(attachment.filename)

    // 调用文件服务下载文件
    await downloadFile(attachment.filename, attachment.name)

    // 显示下载成功提示
    showToast(`文件 "${attachment.name}" 下载成功！`, 'success')
  } catch (error) {
    console.error('下载失败:', error)
    showToast(`文件 "${attachment.name}" 下载失败：${error.message}`, 'error')
  } finally {
    // 从下载中列表移除
    const index = downloadingFiles.value.indexOf(attachment.filename)
    if (index > -1) {
      downloadingFiles.value.splice(index, 1)
    }
  }
}

// 显示提示消息
const showToast = (message, type = 'info') => {
  const toast = document.createElement('div')
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  toast.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg z-50 transition-opacity duration-300`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.style.opacity = '0'
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }
  }, 3000)
}

// 模拟公告数据（更新为包含真实文件名）
const allNotices = ref([
  {
    id: 1,
    title: '关于开展2025年度税收大数据分析工作的通知',
    time: '2025-05-05',
    author: '税务信息化管理中心',
    read: false,
    content: `<p>各省、自治区、直辖市和计划单列市税务局，国家税务总局驻各地特派员办事处，局内各单位：</p>
              <p>为深入贯彻落实党中央、国务院关于数字化转型的战略部署，充分发挥大数据在税收治理现代化中的重要作用，现就开展2025年度税收大数据分析工作通知如下：</p>
              <h4>一、工作目标</h4>
              <p>通过税收大数据分析，提升税收征管精准度，优化纳税服务质量，强化税收风险防控能力，为税收决策提供数据支撑。</p>`,
    attachments: [
      { name: '2025年度税收大数据分析工作方案.docx', filename: '2025年度税收大数据分析工作方案.docx', size: '2.3MB' }
    ]
  },
  {
    id: 2,
    title: '智税平台V2.3版本更新说明',
    time: '2025-05-03',
    author: '税务信息化管理中心',
    read: false,
    content: `<p>各位用户：</p><p>智税平台V2.3版本已于2025年5月3日正式上线，本次更新主要内容如下：</p>`,
    attachments: [
      { name: '智税平台V2.3版本详细说明.pdf', filename: '智税平台V2.3版本详细说明.pdf', size: '3.1MB' }
    ]
  }
])

// 生成更多测试数据
for (let i = 3; i <= 50; i++) {
  allNotices.value.push({
    id: i,
    title: `税务系统公告 ${i} - 重要通知事项`,
    time: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    author: ['税务信息化管理中心', '风险管理司', '税收科学研究所'][Math.floor(Math.random() * 3)],
    read: Math.random() > 0.7,
    content: `<p>这是第 ${i} 条公告的详细内容。</p><p>包含重要的税务政策信息和操作指引。</p>`,
    attachments: Math.random() > 0.5 ? [
      { name: `相关文件${i}.pdf`, filename: `相关文件${i}.pdf`, size: `${(Math.random() * 5 + 1).toFixed(1)}MB` }
    ] : []
  })
}

// 计算属性
const totalPages = computed(() => {
  return Math.ceil(allNotices.value.length / noticesPerPage)
})

const paginatedNotices = computed(() => {
  const startIndex = (currentPage.value - 1) * noticesPerPage
  return allNotices.value.slice(startIndex, startIndex + noticesPerPage)
})

const displayedPageNumbers = computed(() => {
  const maxVisiblePages = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  const pages = []
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

// 方法
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToTop()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scrollToTop()
  }
}

const goToPage = (page) => {
  currentPage.value = page
  scrollToTop()
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openNoticeDetail = (notice) => {
  selectedNotice.value = notice
  showNoticeModal.value = true
}

const markNoticeAsRead = () => {
  if (selectedNotice.value) {
    selectedNotice.value.read = true
    showNoticeModal.value = false
  }
}

const getNoticePreview = (content) => {
  const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

// 生命周期
onMounted(() => {
  // 组件挂载后的逻辑
})
</script>

<style scoped>
.tax-center-app {
  font-family: 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei', sans-serif;
}

.prose {
  line-height: 1.6;
}

.prose h4 {
  font-weight: 600;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-size: 1.1em;
}

.prose p {
  margin-bottom: 1em;
}
</style>
