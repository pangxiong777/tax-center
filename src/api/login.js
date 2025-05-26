import axios from "axios"

// 登录函数
export const login = async (username, password) => {
  try {
    const response = await axios.post("/api/login", { username, password })
    return response.data
  } catch (error) {
    throw error
  }
}

// 退出登录函数
export const logout = async () => {
  try {
    const response = await axios.post("/api/logout")
    return response.data
  } catch (error) {
    throw error
  }
}
