修改server.js中的下面代码：

// Oracle数据库连接配置
oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_23_7' });

oracledb.createPool({
    user: 'swzt_tz',
    password: 'swzt_tz2025',
    connectString: '80.40.16.230:1521/tzswcx',
    poolMax: 10,
    poolMin: 2,
    poolIncrement: 1,
    poolTimeout: 60
});



    // 连接Oracle数据库
    const connection = await oracledb.getConnection()







    // 查询用户信息
    const result = await connection.execute(
      `SELECT SWRY_DM, DLZHKL FROM HX_QX.QX_DLZHXX WHERE SWRY_DM = :username`,
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
    if (user.DLZHKL !== hashedPassword) {
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
      id: user.SWRY_DM,
      username: user.SWRY_DM,
      role: "user",
    })
  }





修改taxcenter.vue中：
loaclhost替换为80.40.16.13