import express from "express"
import cors from "cors"
import crypto from "crypto"
import oracledb from "oracledb"

const app = express()
const PORT = process.env.PORT || 8081


// 中间件
app.use(cors())
app.use(express.json())

// Oracle数据库连接配置
const dbConfig = {
  user: process.env.DB_USER || "system",
  password: process.env.DB_PASSWORD || "qjzx2025",
  connectString: process.env.DB_CONNECT_STRING || "localhost:1521/ORCL",
}

// MD5加密函数
function md5Hash(password) {
  return crypto.createHash("md5").update(password).digest("hex")
}

// 登录API
app.post("/api/login", async (req, res) => {
  let connection

  try {
    const { username, password } = req.body

    // 验证输入参数
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "用户名和密码不能为空",
      })
    }

    // 连接Oracle数据库
    connection = await oracledb.getConnection(dbConfig)

    // MD5加密用户输入的密码
    const hashedPassword = md5Hash(password).toUpperCase()

    console.log("尝试登录:", { username, hashedPassword })

    // 查询用户信息
    const result = await connection.execute(
      `SELECT account, password FROM user_account WHERE account = :username`,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    )

    // 检查用户是否存在
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "用户名不存在",
      })
    }

    const user = result.rows[0]

    // 验证密码
    if (user.PASSWORD !== hashedPassword) {
      return res.status(401).json({
        success: false,
        message: "密码错误",
      })
    }

    // 登录成功
    console.log("登录成功:", username)

    res.json({
      success: true,
      message: "登录成功",
      id: user.ACCOUNT, // Oracle通常返回大写字段名
      username: user.ACCOUNT,
      role: "user", // 可以根据需要从数据库获取角色信息
    })
  } catch (error) {
    console.error("登录错误:", error)

    // 根据错误类型返回不同的错误信息
    if (error.code === "ORA-12541" || error.code === "ORA-12514") {
      return res.status(500).json({
        success: false,
        message: "数据库连接失败，请联系管理员",
      })
    }

    res.status(500).json({
      success: false,
      message: "服务器内部错误，请稍后重试",
    })
  } finally {
    // 关闭数据库连接
    if (connection) {
      try {
        await connection.close()
      } catch (error) {
        console.error("关闭数据库连接时出错:", error)
      }
    }
  }
})

// 测试数据库连接的API
app.get("/api/test-db", async (req, res) => {
  let connection

  try {
    connection = await oracledb.getConnection(dbConfig)

    const result = await connection.execute(
      "SELECT COUNT(*) as count FROM user_account",
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    )

    res.json({
      success: true,
      message: "数据库连接成功",
      userCount: result.rows[0].COUNT,
    })
  } catch (error) {
    console.error("数据库测试错误:", error)
    res.status(500).json({
      success: false,
      message: "数据库连接失败: " + error.message,
    })
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (error) {
        console.error("关闭数据库连接时出错:", error)
      }
    }
  }
})

// 健康检查API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "服务器运行正常",
    timestamp: new Date().toISOString(),
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`)
  console.log(`健康检查: http://localhost:${PORT}/api/health`)
  console.log(`数据库测试: http://localhost:${PORT}/api/test-db`)
})

// 优雅关闭
process.on("SIGINT", async () => {
  console.log("正在关闭服务器...")
  await oracledb.getPool().close(0)
  process.exit(0)
})
