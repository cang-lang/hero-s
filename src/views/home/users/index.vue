<template>
  <div class="users">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索框与添加按钮区域-->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUsers">
            <el-button slot="append" icon="el-icon-search" @click="getUsers"></el-button>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="usersList" stripe border style="width:100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 使用作用域插槽 方式传递数据给父组件，然后可以通过父组件控制子组件的状态 -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStareChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="175px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            <!-- 文字提示 -->
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <!-- 设置按钮 -->
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3,5,7]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户模态框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="resetDialogVisible"
    >
      <!-- 主体内容区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="moble">
          <el-input v-model="addForm.moble" maxlength="11"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { async } from 'q'
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    return {
      usersList: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 3
      },
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        moble: ''
      },
      // 表单验证对象
      addFormRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 验证密码
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        // 验证邮箱
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 验证手机号码
        moble: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // 获取用户列表
    this.getUsers()
  },
  methods: {
    async getUsers () {
      const {
        data: { data, meta }
      } = await this.$http.get('/users', { params: this.queryInfo })
      console.log(data, meta)
      if (meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.usersList = data.users
      this.total = data.total
    },
    // 监听每页显示数据值
    handleSizeChange (newSize) {
      // 每页显示newSize条数据
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUsers()
    },
    // 监听页码值
    handleCurrentChange (newPage) {
      // 当前newPage页
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUsers()
    },
    // 监听状态开关
    async userStareChange (userinfo) {
      const {
        data: { data, meta }
      } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (meta.status !== 200) {
        userinfo = !userinfo
        this.$message.error(meta.msg)
      }
      this.$message.success(meta.msg)
    },
    resetDialogVisible () {
      // console.log(this)
      this.$refs.addFormRef.resetFields()
    },
    // 点击添加用户
    addUser () {
      // console.log(this)
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const { data: { data, meta } } = await this.$http.post('users', this.addForm)
        if (meta.status !== 201) return this.$message.error(meta.msg)
        this.$message.success(meta.msg)
        // 关闭添加用户框
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUsers()
      })
    }
  }
}
</script>
<style lang="less" scoped>
</style>
