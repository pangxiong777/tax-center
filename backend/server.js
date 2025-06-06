import express from "express"
import cors from "cors"
import crypto from "crypto"
import oracledb from "oracledb"
import jwt from "jsonwebtoken" // 新增：用于生成SSO令牌

const app = express()
const PORT = process.env.PORT || 8081


// 新增：SSO密钥配置
const SSO_SECRET = "your_sso_secret_key_here" // 请使用更安全的密钥

// 中间件
app.use(cors())
app.use(express.json())

// Oracle数据库连接配置

oracledb.createPool({
    user: 'system',
    password: 'qjzx2025',
    connectString: 'localhost:1521/ORCL',
    poolMax: 500,
    poolMin: 2,
    poolIncrement: 1,
    poolTimeout: 60
});

// MD5加密函数
function md5Hash(password) {
  return crypto.createHash("md5").update(password).digest("hex")
}

// 新增：生成SSO令牌
function generateSSOToken(userInfo) {
  return jwt.sign(
    {
      username: userInfo.username,
      id: userInfo.id,
      role: userInfo.role,
      timestamp: Date.now(),
    },
    SSO_SECRET,
    { expiresIn: "4h" },
  )
}

// 新增：验证SSO令牌
function verifySSOToken(token) {
  try {
    return jwt.verify(token, SSO_SECRET)
  } catch (error) {
    return null
  }
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
    const connection = await oracledb.getConnection()

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

    const userInfo = {
      id: user.ACCOUNT,
      username: user.ACCOUNT,
      role: "user",
    }

    // 新增：生成SSO令牌
    const ssoToken = generateSSOToken(userInfo)

    res.json({
      success: true,
      message: "登录成功",
      ...userInfo,
      ssoToken: ssoToken, // 新增：返回SSO令牌
    })
  } catch (error) {
    console.error("登录错误:", error)

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
    if (connection) {
      try {
        await connection.close()
      } catch (error) {
        console.error("关闭数据库连接时出错:", error)
      }
    }
  }
})



// 新增：SSO验证API
app.get("/api/sso/verify", (req, res) => {
  const { token } = req.query

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "缺少SSO令牌",
    })
  }

  const decoded = verifySSOToken(token)

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "SSO令牌无效或已过期",
    })
  }

  res.json({
    success: true,
    userInfo: {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    },
  })
})

// 新增：生成SSO跳转URL的API
app.post("/api/sso/generate-url", async (req, res) => {
  const { username, targetUrl } = req.body

  if (!username || !targetUrl) {
    return res.status(400).json({
      success: false,
      message: "缺少必要参数",
    })
  }

  try {
    // 验证用户是否存在
    const connection = await oracledb.getConnection()
    const result = await connection.execute(
      `SELECT account, password FROM user_account WHERE account = :username`,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    )
    await connection.close()

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      })
    }

    // 生成SSO令牌
    const userInfo = {
      id: username,
      username: username,
      role: "user",
    }
    const ssoToken = generateSSOToken(userInfo)

    // 构建跳转URL
    const redirectUrl = `${targetUrl}?ssoToken=${ssoToken}`

    res.json({
      success: true,
      redirectUrl: redirectUrl,
    })
  } catch (error) {
    console.error("生成SSO URL失败:", error)
    res.status(500).json({
      success: false,
      message: "生成SSO URL失败",
    })
  }
})

// 获取用户收藏夹
app.get("/api/favorites/:userAccount", async (req, res) => {
  let connection

  try {
    const { userAccount } = req.params

    const connection = await oracledb.getConnection()

    const result = await connection.execute(
      `SELECT app_name, app_icon, app_color, app_description, app_url, app_category
       FROM user_favorites
       WHERE user_account = :userAccount
       ORDER BY created_at DESC`,
      { userAccount },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    )

    const favorites = result.rows.map((row) => ({
      name: row.APP_NAME,
      icon: row.APP_ICON,
      color: row.APP_COLOR,
      description: row.APP_DESCRIPTION,
      url: row.APP_URL,
      category: row.APP_CATEGORY,
    }))

    res.json({
      success: true,
      favorites,
    })
  } catch (error) {
    console.error("获取收藏夹失败:", error)
    res.status(500).json({
      success: false,
      message: "获取收藏夹失败",
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

// 添加收藏
app.post("/api/favorites", async (req, res) => {
  let connection

  try {
    const { userAccount, app } = req.body

    if (!userAccount || !app) {
      return res.status(400).json({
        success: false,
        message: "用户账户和应用信息不能为空",
      })
    }

    const connection = await oracledb.getConnection()

    await connection.execute(
      `INSERT INTO user_favorites (user_account, app_name, app_icon, app_color, app_description, app_url, app_category)
       VALUES (:userAccount, :appName, :appIcon, :appColor, :appDescription, :appUrl, :appCategory)`,
      {
        userAccount,
        appName: app.name,
        appIcon: app.icon,
        appColor: app.color,
        appDescription: app.description,
        appUrl: app.url || null,
        appCategory: app.category || null,
      },
    )

    await connection.commit()

    res.json({
      success: true,
      message: "添加收藏成功",
    })
  } catch (error) {
    console.error("添加收藏失败:", error)

    if (error.errorNum === 1) {
      // 唯一约束违反
      return res.status(409).json({
        success: false,
        message: "该应用已在收藏夹中",
      })
    }

    res.status(500).json({
      success: false,
      message: "添加收藏失败",
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

// 删除收藏
app.delete("/api/favorites/:userAccount/:appName", async (req, res) => {
  let connection

  try {
    const { userAccount, appName } = req.params

    const connection = await oracledb.getConnection()

    const result = await connection.execute(
      `DELETE FROM user_favorites
       WHERE user_account = :userAccount AND app_name = :appName`,
      { userAccount, appName },
    )

    await connection.commit()

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "收藏记录不存在",
      })
    }

    res.json({
      success: true,
      message: "删除收藏成功",
    })
  } catch (error) {
    console.error("删除收藏失败:", error)
    res.status(500).json({
      success: false,
      message: "删除收藏失败",
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

// 检查应用是否已收藏
app.get("/api/favorites/:userAccount/check/:appName", async (req, res) => {
  let connection

  try {
    const { userAccount, appName } = req.params

    const connection = await oracledb.getConnection()

    const result = await connection.execute(
      `SELECT COUNT(*) as count FROM user_favorites
       WHERE user_account = :userAccount AND app_name = :appName`,
      { userAccount, appName },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    )

    const isFavorite = result.rows[0].COUNT > 0

    res.json({
      success: true,
      isFavorite,
    })
  } catch (error) {
    console.error("检查收藏状态失败:", error)
    res.status(500).json({
      success: false,
      message: "检查收藏状态失败",
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

// 测试数据库连接的API
app.get("/api/test-db", async (req, res) => {
  let connection

  try {
    const connection = await oracledb.getConnection()

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

// 新增：SSO令牌生成接口
app.get("/api/sso/generate-token", async (req, res) => {
  try {
    const { username } = req.query

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "缺少用户名参数",
      })
    }

    // 生成随机令牌
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date()
    expires.setMinutes(expires.getMinutes() + 5) // 5分钟有效期

    // 存储令牌
    const tempTokens = new Map()
    tempTokens.set(token, {
      username,
      expires,
    })

    // 设置定时器，过期后自动删除令牌
    setTimeout(
      () => {
        tempTokens.delete(token)
      },
      5 * 60 * 1000,
    )

    res.json({
      success: true,
      token,
      expires: expires.toISOString()
    })
  } catch (error) {
    console.error("生成SSO令牌失败:", error)
    res.status(500).json({
      success: false,
      message: "生成SSO令牌失败",
    })
  }
})

// 新增：验证SSO令牌接口
app.get("/api/sso/verify-token", async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "缺少令牌参数",
      })
    }

    const tokenData = tempTokens.get(token)

    if (!tokenData) {
      return res.status(401).json({
        success: false,
        message: "无效的令牌",
      })
    }

    if (new Date() > tokenData.expires) {
      tempTokens.delete(token)
      return res.status(401).json({
        success: false,
        message: "令牌已过期",
      })
    }

    res.json({
      success: true,
      username: tokenData.username
    })
  } catch (error) {
    console.error("验证SSO令牌失败:", error)
    res.status(500).json({
      success: false,
      message: "验证SSO令牌失败",
    })
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
app.listen(PORT, async () => {
  console.log(`服务器运行在端口 ${PORT}`)
  console.log(`健康检查: http://localhost:${PORT}/api/health`)
  console.log(`数据库测试: http://localhost:${PORT}/api/test-db`)

  // // 初始化数据库
  // await initDatabase()
})

// 优雅关闭
process.on("SIGINT", async () => {
  console.log("正在关闭服务器...")
  try {
    await oracledb.getPool().close(0)
  } catch (error) {
    console.error("关闭连接池失败:", error)
  }
  process.exit(0)
})
