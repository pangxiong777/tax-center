import axios from "axios"

// 退出登录函数
export const logout = async () => {
  try {
    const response = await axios.post("/api/logout")
    return response.data
  } catch (error) {
    throw error
  }
}
