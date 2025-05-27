// 文件下载服务
export const downloadFile = async (filename, displayName = null) => {
    try {
        // 构建文件URL，指向uploads目录
        const fileUrl = `/uploads/${encodeURIComponent(filename)}`

        // 使用fetch获取文件
        const response = await fetch(fileUrl)

        if (!response.ok) {
            throw new Error(`文件不存在或无法访问 (HTTP ${response.status})`)
        }

        // 获取文件blob
        const blob = await response.blob()

        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = displayName || filename

        // 设置链接样式，确保不可见
        link.style.display = "none"

        // 触发下载
        document.body.appendChild(link)
        link.click()

        // 清理
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        return { success: true, message: "下载成功" }
    } catch (error) {
        console.error("下载失败:", error)
        throw new Error(error.message || "文件下载失败")
    }
}

// 检查文件是否存在
export const checkFileExists = async (filename) => {
    try {
        const fileUrl = `/uploads/${encodeURIComponent(filename)}`
        const response = await fetch(fileUrl, { method: "HEAD" })
        return response.ok
    } catch (error) {
        return false
    }
}

export default {
    downloadFile,
    checkFileExists,
}

