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
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 文字提示 -->
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <!-- 设置按钮 -->
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
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

    <!-- 添加用户信息对话框 -->
    <el-dialog
      title="添加信息"
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
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile" maxlength="11"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息对话框 -->
    <el-dialog
      title="修改信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="resetEditDialogVisible"
    >
      <!-- 主体内容区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile" maxlength="11"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRolelDialogVisible" width="50%" @close="colseRolelDialogVisible">
      <!-- 主体内容区域 -->
      <div>
        <p>当前用户 : {{userInfo.username}}</p>
        <p>当前角色 : {{userInfo.role_name}}</p>
        <p>
          分配新角色 :
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolelDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
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
      // 控制对话框显示与隐藏
      addDialogVisible: false,
      editDialogVisible: false,
      setRolelDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {},
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
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户信息表单验证对象
      editFormRules: {
        // 验证用户名
        username: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 验证邮箱
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        // 验证手机号码
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 需要被分配的角色的用户信息
      userInfo: {},
      // 所有角色信息
      rolesList: [],
      // 已选中的角色的ID值
      selectRoleId: ''
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
    // 添加用户项 重置
    resetDialogVisible () {
      // console.log(this)
      this.$refs.addFormRef.resetFields()
    },
    // 修改用户项  重置
    resetEditDialogVisible () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定提交添加用户
    addUser () {
      // console.log(this)
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const {
          data: { data, meta }
        } = await this.$http.post('users', this.addForm)
        if (meta.status !== 201) return this.$message.error(meta.msg)
        this.$message.success(meta.msg)
        // 关闭添加用户框
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUsers()
      })
    },
    async showEditDialog (id) {
      this.editDialogVisible = true
      console.log(id)
      const {
        data: { data, meta }
      } = await this.$http.get('users/' + id)
      console.log(data)
      this.editForm = data
    },
    // 点击确定提交修改信息
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        const {
          data: { data, meta }
        } = await this.$http.put('users/' + this.editForm.id, this.editForm)
        if (meta.status !== 200) return this.$message.error(meta.msg)
        this.$message.success(meta.msg)
        // 关闭修改用户信息框
        this.editDialogVisible = false
        // 重新获取用户列表
        this.getUsers()
      })
    },
    async removeUserById (id) {
      // console.log(id)
      try {
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const {
          data: { data, meta }
        } = await this.$http.delete('users/' + id)
        if (meta.status !== 200) return this.$message.error(meta.msg)
        this.$message.success(meta.msg)
        // 重新获取用户列表
        this.getUsers()
      } catch (error) {
        this.$message.info('取消删除')
      }
    },
    // 监听分配权限事件
    async setRole (userInfo) {
      // 把需要分配的角色用户信息放入data中
      this.userInfo = userInfo
      // console.log(this.userInfo)
      const {
        data: { data, meta }
      } = await this.$http.get('roles')
      // console.log(data)
      if (meta.status !== 200) return this.$message.error('获取角色信息失败')
      // 把所有角色信息放入data中
      this.rolesList = data
      this.setRolelDialogVisible = true
    },
    // 点击按钮，分配角色
    async saveRoleInfo () {
      if (!this.selectRoleId) return this.$message.error('请选择用户角色')
      console.log(this.userInfo)

      const { data: { data, meta } } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectRoleId
      })

      if (meta.status !== 200) return this.$message.error('跟新角色失败')
      this.$message.success('更新角色成功')
      this.getUsers()
      this.setRolelDialogVisible = false
    },
    // 监听分配角色关闭事件
    colseRolelDialogVisible () {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>
<style lang="less" scoped>
</style>
