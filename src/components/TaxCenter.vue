<template>
  <div class="tax-center-app bg-gray-50 min-h-screen">
    <!-- 登录模态框 -->
    <div v-if="showLoginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">用户登录</h2>
          <button @click="showLoginModal = false" class="text-gray-500 hover:text-gray-700">
            <X class="h-5 w-5" />
          </button>
        </div>
        <div v-if="loginError" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ loginError }}
        </div>
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
                v-model="loginForm.username"
                type="text"
                id="username"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入用户名"
                required
            />
          </div>
          <div class="mb-6">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
                v-model="loginForm.password"
                type="password"
                id="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入密码"
                required
            />
          </div>
          <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :disabled="isLoggingIn"
          >
            {{ isLoggingIn ? '登录中...' : '登录' }}
          </button>
        </form>
      </div>
    </div>

    <!-- 查看全部功能模态框 -->
    <div v-if="showAllAppsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-5xl max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">全部功能</h2>
          <button @click="showAllAppsModal = false" class="text-gray-500 hover:text-gray-700">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
              v-for="(app, index) in allApplications"
              :key="index"
              class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer relative"
          >
            <a :href="app.url || '#'" :target="app.url ? '_blank' : ''" class="block no-underline">
              <div class="flex items-start">
                <div :class="`bg-${app.color}-100 p-2 rounded-lg`">
                  <component :is="app.icon" class="h-5 w-5" :class="`text-${app.color}-600`" />
                </div>
                <div class="ml-3">
                  <h3 class="font-medium text-gray-900">{{ app.name }}</h3>
                  <p class="text-xs text-gray-500 mt-1">{{ app.description }}</p>
                </div>
              </div>
            </a>
            <button
                @click.stop="toggleFavorite(app)"
                class="absolute top-2 right-2 text-gray-400 hover:text-yellow-500 focus:outline-none"
                :class="{ 'text-yellow-500': isFavorite(app) }"
            >
              <Star class="h-4 w-4" :fill="isFavorite(app) ? 'currentColor' : 'none'" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 公告详情模态框 -->
    <div v-if="showNoticeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
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
            <div class="relative">
              <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索应用..."
                  class="bg-gray-100 rounded-full py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <div class="absolute left-3 top-2.5">
                <Search class="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div class="ml-4 flex items-center">
              <div class="ml-4 relative">
                <div v-if="currentUser" class="flex items-center cursor-pointer" @click="toggleUserMenu">
                  <img
                      class="h-8 w-8 rounded-full"
                      src="/images/1.jpg"
                      alt="用户头像"
                  />
                  <span class="ml-2 text-sm font-medium text-gray-700 hidden md:block">{{ currentUser.username }}</span>
                  <ChevronDown class="ml-1 h-4 w-4 text-gray-500" />
                </div>
                <button
                    v-else
                    @click="showLoginModal = true"
                    class="ml-2 px-4 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                >
                  登录
                </button>
                <div
                    v-if="showUserMenu && currentUser"
                    class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                >
                  <div class="py-1">
                    <a @click="handleLogout" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">退出登录</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="container mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row">
        <!-- 左侧边栏 -->
        <div class="w-full md:w-64 mb-6 md:mb-0 md:mr-6 md:sticky md:top-6 md:self-start">
          <!-- 公告栏 -->
          <div class="bg-white rounded-lg shadow p-4 mb-6">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-lg font-medium text-gray-900">公告栏</h3>
              <button @click="router.push('/notice')" class="text-xs text-blue-600 hover:text-blue-800">全部公告</button>
            </div>
            <div class="space-y-3">
              <div
                  v-for="(notice, index) in notifications"
                  :key="index"
                  class="border-b border-gray-100 pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 rounded-md p-2 -mx-2"
                  @click="openNoticeDetail(notice)"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0 mt-0.5">
                    <div :class="[
                      'h-2 w-2 rounded-full',
                      notice.read ? 'bg-gray-300' : 'bg-blue-500'
                    ]"></div>
                  </div>
                  <div class="ml-2 flex-1">
                    <div class="text-sm font-medium text-gray-700">{{ notice.title }}</div>
                    <div class="text-xs text-gray-400 mt-1">{{ notice.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 收藏夹 -->
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-medium text-gray-900 mb-3">收藏夹</h3>
            <ul class="space-y-2">
              <li v-for="(app, index) in favorites" :key="index" class="relative">
                <a :href="app.url || '#'" :target="app.url ? '_blank' : ''" class="flex items-center text-gray-600 hover:text-blue-600 py-1.5 pr-8">
                  <component :is="app.icon" class="h-5 w-5 mr-2" :class="`text-${app.color}-600`" />
                  <span>{{ app.name }}</span>
                </a>
                <button
                    @click.stop="toggleFavorite(app)"
                    class="absolute top-2 right-2 text-yellow-500 hover:text-yellow-600 focus:outline-none"
                >
                  <Star class="h-4 w-4" fill="currentColor" />
                </button>
              </li>
              <li v-if="favorites.length === 0" class="text-sm text-gray-500 italic py-2">
                暂无收藏，点击应用右下角星标添加
              </li>
            </ul>
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="flex-1">
          <!-- 轮播图 -->
          <div class="bg-white rounded-lg shadow mb-6 overflow-hidden">
            <div class="relative h-64">
              <div class="absolute inset-0 flex">
                <div class="w-full h-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center">
                  <div class="px-8 md:px-12 w-full md:w-1/2">
                    <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">智慧税务 数字赋能</h2>
                    <p class="text-white text-opacity-90 mb-6">
                      整合税务系统资源，提供一站式税务服务平台，助力税收治理现代化
                    </p>
                  </div>
                </div>
                <div class="hidden md:block w-1/2 h-full bg-center bg-cover" style="background-image: url('/images/2.avif')"></div>
              </div>
            </div>
          </div>

          <!-- 强基项目 -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-900">强基项目</h2>
              <button
                  @click="showAllAppsModal = true"
                  class="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                查看全部 <ChevronRight class="h-4 w-4 ml-1" />
              </button>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div
                  v-for="(app, index) in limitedAllApplications"
                  :key="index"
                  class="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer relative"
              >
                <a :href="app.url || '#'" :target="app.url ? '_blank' : ''" class="block no-underline">
                  <div class="flex flex-col items-center">
                    <div :class="`bg-${app.color}-100 p-3 rounded-lg mb-3`">
                      <component :is="app.icon" class="h-6 w-6" :class="`text-${app.color}-600`" />
                    </div>
                    <div class="text-center">
                      <h3 class="font-medium text-gray-900">{{ app.name }}</h3>
                      <p class="text-xs text-gray-500 mt-1">{{ app.description }}</p>
                    </div>
                  </div>
                </a>
                <button
                    @click.stop="toggleFavorite(app)"
                    class="absolute top-2 right-2 text-gray-400 hover:text-yellow-500 focus:outline-none"
                    :class="{ 'text-yellow-500': isFavorite(app) }"
                >
                  <Star class="h-4 w-4" :fill="isFavorite(app) ? 'currentColor' : 'none'" />
                </button>
              </div>
            </div>
          </div>

          <!-- 应用分类 -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-gray-900">应用分类</h2>
            </div>

            <div class="bg-white rounded-lg shadow overflow-hidden">
              <div class="border-b border-gray-200">
                <div class="flex overflow-x-auto">
                  <button
                      v-for="(category, index) in categories"
                      :key="index"
                      @click="activeCategory = category.id"
                      :class="[
                      'px-4 py-3 text-sm font-medium whitespace-nowrap',
                      activeCategory === category.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    ]"
                  >
                    {{ category.name }}
                  </button>
                </div>
              </div>

              <div class="p-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div
                      v-for="(app, index) in paginatedApps"
                      :key="index"
                      class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer relative"
                  >
                    <a :href="app.url || '#'" :target="app.url ? '_blank' : ''" class="block no-underline">
                      <div class="flex items-start">
                        <div :class="`bg-${app.color}-100 p-2 rounded-lg`">
                          <component :is="app.icon" class="h-5 w-5" :class="`text-${app.color}-600`" />
                        </div>
                        <div class="ml-3">
                          <h3 class="font-medium text-gray-900">{{ app.name }}</h3>
                          <p class="text-xs text-gray-500 mt-1">{{ app.description }}</p>
                        </div>
                      </div>
                    </a>
                    <button
                        @click.stop="toggleFavorite(app)"
                        class="absolute top-2 right-2 text-gray-400 hover:text-yellow-500 focus:outline-none"
                        :class="{ 'text-yellow-500': isFavorite(app) }"
                    >
                      <Star class="h-4 w-4" :fill="isFavorite(app) ? 'currentColor' : 'none'" />
                    </button>
                  </div>
                </div>
              </div>
              <!-- 分页控件 -->
              <div class="flex justify-center mt-6">
                <nav class="flex items-center">
                  <button
                      @click="prevPage"
                      :disabled="currentPage === 1"
                      class="px-3 py-1 rounded-md mr-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft class="h-5 w-5" />
                  </button>

                  <div class="flex space-x-1">
                    <button
                        v-for="page in displayedPageNumbers"
                        :key="page"
                        @click="goToPage(page)"
                        :class="[
                        'px-3 py-1 rounded-md',
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
                      class="px-3 py-1 rounded-md ml-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight class="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

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
import { useRouter } from 'vue-router'
const router = useRouter()
import { ref, computed, onMounted, watch } from 'vue'
import {
  BarChart3,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  FileText,
  PieChart,
  Users,
  Database,
  BarChart,
  Calculator,
  FileCheck,
  BookOpen,
  CreditCard,
  Landmark,
  Receipt,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  X,
  Eye,
  UserCog,
  Monitor,
  Flag,
  Globe,
  Presentation,
  MessageSquare,
  Star,
  LifeBuoy,
  Briefcase,
  Scale,
  Calendar,
  User,
  Download
} from 'lucide-vue-next'
import axios from 'axios'
import { downloadFile } from '../api/fileService'

// 用户登录状态
const currentUser = ref(null)
const showLoginModal = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})
const loginError = ref('')
const isLoggingIn = ref(false)
const showUserMenu = ref(false)

// 查看全部功能模态框
const showAllAppsModal = ref(false)

// 收藏夹
const favorites = ref([])

// 公告详情模态框
const showNoticeModal = ref(false)
const selectedNotice = ref(null)

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

// 检查是否已登录和加载收藏夹
onMounted(() => {
  // 检查登录状态
  const savedUser = localStorage.getItem('currentUser')
  if (savedUser) {
    try {
      currentUser.value = JSON.parse(savedUser)
    } catch (e) {
      localStorage.removeItem('currentUser')
    }
  }

  // 加载收藏夹
  const savedFavorites = localStorage.getItem('favorites')
  if (savedFavorites) {
    try {
      favorites.value = JSON.parse(savedFavorites)
    } catch (e) {
      localStorage.removeItem('favorites')
    }
  }

  // 加载公告已读状态
  const readNotices = localStorage.getItem('readNotices')
  if (readNotices) {
    try {
      const readIds = JSON.parse(readNotices)
      notifications.forEach(notice => {
        if (readIds.includes(notice.id)) {
          notice.read = true
        }
      })
    } catch (e) {
      localStorage.removeItem('readNotices')
    }
  }
})

// 收藏功能
const toggleFavorite = (app) => {
  const index = favorites.value.findIndex(fav => fav.name === app.name)
  if (index === -1) {
    favorites.value.push(app)
  } else {
    favorites.value.splice(index, 1)
  }
  localStorage.setItem('favorites', JSON.stringify(favorites.value))
}

// 检查应用是否已收藏
const isFavorite = (app) => {
  return favorites.value.some(fav => fav.name === app.name)
}

// 登录处理
const handleLogin = async () => {
  try {
    isLoggingIn.value = true
    loginError.value = ''

    const response = await axios.post('/api/login', {
      username: loginForm.value.username,
      password: loginForm.value.password
    })

    currentUser.value = {
      id: response.data.id,
      username: response.data.username,
      role: response.data.role
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    showLoginModal.value = false

    loginForm.value = {
      username: '',
      password: ''
    }
  } catch (error) {
    console.error('登录失败:', error)
    loginError.value = error.response?.data?.message || '登录失败，请检查用户名和密码'
  } finally {
    isLoggingIn.value = false
  }
}

// 退出登录
const handleLogout = () => {
  currentUser.value = null
  localStorage.removeItem('currentUser')
  showUserMenu.value = false
}

// 用户菜单状态
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 搜索
const searchQuery = ref('')

// 公告功能
const openNoticeDetail = (notice) => {
  selectedNotice.value = notice
  showNoticeModal.value = true
}

const markNoticeAsRead = () => {
  if (selectedNotice.value) {
    selectedNotice.value.read = true

    const readNotices = localStorage.getItem('readNotices')
    let readIds = []

    if (readNotices) {
      try {
        readIds = JSON.parse(readNotices)
      } catch (e) {
        readIds = []
      }
    }

    if (!readIds.includes(selectedNotice.value.id)) {
      readIds.push(selectedNotice.value.id)
    }

    localStorage.setItem('readNotices', JSON.stringify(readIds))
    showNoticeModal.value = false
  }
}

// 通知数据（更新为包含真实文件名）
const notifications = [
  {
    id: 1,
    title: '关于开展2025年度税收大数据分析工作的通知',
    time: '2025-05-05',
    author: '税务信息化管理中心',
    read: false,
    content: `<p>各省、自治区、直辖市和计划单列市税务局，国家税务总局驻各地特派员办事处，局内各单位：</p>
              <p>为深入贯彻落实党中央、国务院关于数字化转型的战略部署，充分发挥大数据在税收治理现代化中的重要作用，现就开展2025年度税收大数据分析工作通知如下：</p>
              <h4>一、工作目标</h4>
              <p>通过税收大数据分析，提升税收征管精准度，优化纳税服务质量，强化税收风险防控能力，为税收决策提供数据支撑。</p>
              <h4>二、重点任务</h4>
              <p>1. 构建全国统一的税收大数据分析平台</p>
              <p>2. 开展重点行业税收遵从度分析</p>
              <p>3. 推进税收大数据与外部数据融合应用</p>
              <p>4. 加强税收大数据安全管理</p>
              <h4>三、工作要求</h4>
              <p>各单位要高度重视，加强组织领导，确保按时完成各项任务。</p>`,
    attachments: [
      { name: '2025年度税收大数据分析工作方案.docx', filename: '2025年度税收大数据分析工作方案.docx', size: '2.3MB' },
      { name: '税收大数据分析技术规范.pdf', filename: '税收大数据分析技术规范.pdf', size: '1.5MB' }
    ]
  },
  {
    id: 2,
    title: '智税平台V2.3版本更新说明',
    time: '2025-05-03',
    author: '税务信息化管理中心',
    read: false,
    content: `<p>各位用户：</p>
              <p>智税平台V2.3版本已于2025年5月3日正式上线，本次更新主要内容如下：</p>
              <h4>一、功能优化</h4>
              <p>1. 优化了数据可视化展示效果</p>
              <p>2. 提升了系统响应速度</p>
              <p>3. 增强了跨部门数据协同能力</p>
              <h4>二、新增功能</h4>
              <p>1. 新增智能风险预警模块</p>
              <p>2. 新增纳税人画像功能</p>
              <p>3. 新增移动端适配</p>
              <h4>三、问题修复</h4>
              <p>修复了已知的10个系统bug，提升了系统稳定性。</p>`,
    attachments: [
      { name: '智税平台V2.3版本详细说明.pdf', filename: '智税平台V2.3版本详细说明.pdf', size: '3.1MB' }
    ]
  },
  {
    id: 3,
    title: '关于加强税收风险管理的工作指引',
    time: '2025-04-28',
    author: '风险管理司',
    read: false,
    content: `<p>各省、自治区、直辖市和计划单列市税务局：</p>
              <p>为进一步加强税收风险管理，提高风险应对效能，现提出以下工作指引：</p>
              <h4>一、总体要求</h4>
              <p>坚持风险导向，强化数据驱动，推进智能化风险识别与精准化风险应对。</p>
              <h4>二、主要内容</h4>
              <p>1. 健全风险管理组织体系</p>
              <p>2. 完善风险识别指标体系</p>
              <p>3. 优化风险应对流程</p>
              <p>4. 加强风险管理评估</p>
              <h4>三、保障措施</h4>
              <p>加强组织领导，强化技术支撑，完善考核机制。</p>`,
    attachments: [
      { name: '税收风险管理工作指引.pdf', filename: '税收风险管理工作指引.pdf', size: '2.7MB' },
      { name: '风险指标体系说明.xlsx', filename: '风险指标体系说明.xlsx', size: '1.2MB' }
    ]
  },
  {
    id: 4,
    title: '第三季度税收数据分析报告已发布',
    time: '2025-04-25',
    author: '税收科学研究所',
    read: false,
    content: `<p>各相关单位：</p>
              <p>2025年第三季度税收数据分析报告已完成编制并发布，主要内容包括：</p>
              <h4>一、总体税收形势</h4>
              <p>第三季度全国税收收入同比增长8.5%，增速较上季度提高1.2个百分点。</p>
              <h4>二、重点行业分析</h4>
              <p>1. 制造业税收同比增长9.3%</p>
              <p>2. 服务业税收同比增长10.1%</p>
              <p>3. 房地产业税收同比下降2.5%</p>
              <h4>三、区域税收分析</h4>
              <p>东部地区税收增长8.9%，中部地区增长9.2%，西部地区增长7.8%，东北地区增长6.5%。</p>
              <h4>四、政策效应分析</h4>
              <p>减税降费政策效应持续显现，有效支持了实体经济发展。</p>`,
    attachments: [
      { name: '2025年第三季度税收数据分析报告.pdf', filename: '2025年第三季度税收数据分析报告.pdf', size: '4.5MB' },
      { name: '季度税收数据表.xlsx', filename: '季度税收数据表.xlsx', size: '2.1MB' }
    ]
  }
]

// 强基项目
const allApplications = [
  { name: '指标全生命周期管理', icon: LifeBuoy, color: 'blue', description: '指标管理与监控平台', url: '#' },
  { name: '智税展示', icon: Presentation, color: 'green', description: '税务数据可视化展示', url: '#' },
  { name: '税费服务诉求', icon: MessageSquare, color: 'purple', description: '税费服务与诉求处理', url: '#' },
  { name: '税费融合', icon: CreditCard, color: 'orange', description: '税费业务一体化管理', url: '#' },
  { name: '慧眼', icon: Eye, color: 'red', description: '税务风险智能监控', url: '#' },
  { name: '数智人事', icon: UserCog, color: 'indigo', description: '人事管理数字化平台', url: '#' },
  { name: '定期定额进项监控', icon: Monitor, color: 'yellow', description: '定期定额业务监控', url: '#' },
  { name: '智慧党建', icon: Flag, color: 'pink', description: '党建工作数字化平台', url: '#' },
  { name: '跨区域管理', icon: Globe, color: 'teal', description: '跨区域税务协同管理', url: '#' },
  { name: '案管系统', icon: Briefcase, color: 'cyan', description: '税务案件管理系统', url: '#' }
]

// 限制强基项目显示为2行4列
const limitedAllApplications = computed(() => {
  const appsPerRow = 4
  const maxRows = 2
  return allApplications.slice(0, appsPerRow * maxRows)
})

// 应用分类
const categories = [
  { id: 'all', name: '全部' },
  { id: 'collection', name: '征收管理' },
  { id: 'inspection', name: '稽查管理' },
  { id: 'service', name: '纳税服务' },
  { id: 'analysis', name: '数据分析' },
  { id: 'risk', name: '风险管理' },
  { id: 'policy', name: '政策法规' }
]

const activeCategory = ref('all')

// 监听分类变化，重置页码
watch(activeCategory, () => {
  currentPage.value = 1
})

const currentPage = ref(1)
const appsPerPage = 9

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(filteredApps.value.length / appsPerPage)
})

// 根据当前页码获取应用
const paginatedApps = computed(() => {
  const startIndex = (currentPage.value - 1) * appsPerPage
  return filteredApps.value.slice(startIndex, startIndex + appsPerPage)
})

// 分页功能
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page) => {
  currentPage.value = page
}

// 显示的页码数
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

// 所有应用
const allApps = [
  // 征收管理
  { name: '申报管理系统', icon: FileText, color: 'blue', category: 'collection', description: '纳税申报与管理', url: '#' },
  { name: '发票管理平台', icon: Receipt, color: 'green', category: 'collection', description: '发票开具与管理', url: '#' },
  { name: '税款征收系统', icon: CreditCard, color: 'indigo', category: 'collection', description: '税款征收与入库', url: '#' },
  { name: '减免税管理', icon: Calculator, color: 'red', category: 'collection', description: '税收减免申请与审批', url: '#' },
  { name: '税费融合管理', icon: Scale, color: 'purple', category: 'collection', description: '税费一体化管理', url: '#' },
  { name: '定期定额管理', icon: Monitor, color: 'yellow', category: 'collection', description: '定期定额业务管理', url: '#' },

  // 稽查管理
  { name: '稽查案件管理', icon: FileCheck, color: 'orange', category: 'inspection', description: '税务稽查案件管理', url: '#' },
  { name: '税收风险监控', icon: AlertCircle, color: 'red', category: 'inspection', description: '税收风险实时监控', url: '#' },
  { name: '稽查分析工具', icon: PieChart, color: 'purple', category: 'inspection', description: '稽查数据分析工具', url: '#' },
  { name: '案管系统', icon: Briefcase, color: 'cyan', category: 'inspection', description: '税务案件管理系统', url: '#' },
  { name: '跨区域协查', icon: Globe, color: 'teal', category: 'inspection', description: '跨区域稽查协作', url: '#' },

  // 纳税服务
  { name: '纳税人服务平台', icon: Users, color: 'blue', category: 'service', description: '纳税人在线服务', url: '#' },
  { name: '税收政策咨询', icon: HelpCircle, color: 'green', category: 'service', description: '税收政策在线咨询', url: '#' },
  { name: '办税指南', icon: BookOpen, color: 'indigo', category: 'service', description: '办税流程与指南', url: '#' },
  { name: '税费服务诉求', icon: MessageSquare, color: 'purple', category: 'service', description: '税费服务与诉求处理', url: '#' },
  { name: '智能客服', icon: MessageSquare, color: 'pink', category: 'service', description: '智能问答服务', url: '#' },

  // 数据分析
  { name: '税收数据分析', icon: BarChart, color: 'purple', category: 'analysis', description: '税收数据多维分析', url: '#' },
  { name: '税收预测模型', icon: TrendingUp, color: 'green', category: 'analysis', description: '税收趋势预测', url: '#' },
  { name: '区域税收分析', icon: PieChart, color: 'blue', category: 'analysis', description: '区域税收对比分析', url: '#' },
  { name: '行业税负分析', icon: BarChart3, color: 'orange', category: 'analysis', description: '行业税负水平分析', url: '#' },
  { name: '智税展示', icon: Presentation, color: 'green', category: 'analysis', description: '税务数据可视化展示', url: '#' },
  { name: '指标全生命周期管理', icon: LifeBuoy, color: 'blue', category: 'analysis', description: '指标管理与监控平台', url: '#' },

  // 风险管理
  { name: '风险识别系统', icon: AlertCircle, color: 'red', category: 'risk', description: '税收风险智能识别', url: '#' },
  { name: '纳税人信用评级', icon: Users, color: 'blue', category: 'risk', description: '纳税人信用等级评定', url: '#' },
  { name: '风险应对策略', icon: FileCheck, color: 'green', category: 'risk', description: '税收风险应对策略', url: '#' },
  { name: '慧眼', icon: Eye, color: 'red', category: 'risk', description: '税务风险智能监控', url: '#' },
  { name: '大数据风控', icon: Database, color: 'indigo', category: 'risk', description: '大数据风险控制', url: '#' },

  // 政策法规
  { name: '税收法规库', icon: BookOpen, color: 'indigo', category: 'policy', description: '税收法律法规查询', url: '#' },
  { name: '政策解读平台', icon: FileText, color: 'purple', description: '税收政策专业解读', url: '#' },
  { name: '税收案例库', icon: Landmark, color: 'blue', description: '典型税收案例分析', url: '#' },
  { name: '政策执行指南', icon: FileCheck, color: 'green', description: '政策执行操作指南', url: '#' },
  { name: '税收条约库', icon: Globe, color: 'teal', description: '国际税收条约查询', url: '#' }
]

// 根据分类筛选应用
const filteredApps = computed(() => {
  if (activeCategory.value === 'all') {
    return allApps
  } else {
    return allApps.filter(app => app.category === activeCategory.value)
  }
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
