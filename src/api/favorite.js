import axios from "axios"

// 获取用户收藏
export const getFavorites = async (userId) => {
  try {
    const response = await axios.get("/api/favorites", {
      headers: {
        Authorization: userId,
      },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// 添加收藏
export const addFavorite = async (userId, appName) => {
  try {
    const response = await axios.post(
      "/api/favorites",
      { appName },
      {
        headers: {
          Authorization: userId,
        },
      },
    )
    return response.data
  } catch (error) {
    throw error
  }
}

// 删除收藏
export const removeFavorite = async (userId, appName) => {
  try {
    const response = await axios.delete("/api/favorites", {
      headers: {
        Authorization: userId,
      },
      data: { appName },
    })
    return response.data
  } catch (error) {
    throw error
  }
}
