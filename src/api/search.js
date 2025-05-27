import axios from "axios"

// 搜索API服务
export class SearchAPI {
  static baseURL = "/api"

  // 搜索应用
  static async searchApps(query, filters = {}) {
    try {
      const response = await axios.get(`${this.baseURL}/search/apps`, {
        params: {
          q: query,
          category: filters.category,
          limit: filters.limit || 20,
          offset: filters.offset || 0,
        },
      })
      return response.data
    } catch (error) {
      console.error("搜索应用失败:", error)
      throw error
    }
  }

  // 获取搜索建议
  static async getSearchSuggestions(query) {
    try {
      const response = await axios.get(`${this.baseURL}/search/suggestions`, {
        params: { q: query },
      })
      return response.data
    } catch (error) {
      console.error("获取搜索建议失败:", error)
      return []
    }
  }

  // 记录搜索历史
  static async recordSearchHistory(query, userId = null) {
    try {
      await axios.post(`${this.baseURL}/search/history`, {
        query,
        userId,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("记录搜索历史失败:", error)
    }
  }

  // 获取热门搜索
  static async getPopularSearches(limit = 10) {
    try {
      const response = await axios.get(`${this.baseURL}/search/popular`, {
        params: { limit },
      })
      return response.data
    } catch (error) {
      console.error("获取热门搜索失败:", error)
      return []
    }
  }

  // 获取搜索统计
  static async getSearchStats() {
    try {
      const response = await axios.get(`${this.baseURL}/search/stats`)
      return response.data
    } catch (error) {
      console.error("获取搜索统计失败:", error)
      return {}
    }
  }
}
