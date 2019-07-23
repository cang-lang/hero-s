<template>
  <div class="params">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意，只允许为第三级分类设置相关参数" show-icon :closable="false" type="warning"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            expand-trigger="hover"
            :options="cateList"
            :props="cateProps"
            v-model="selectedCateKeys"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="showDialogVisible"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableDate" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column prop="attr_name" type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEidtDialogVisible(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  size="mini"
                  type="warning"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加静态属性按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="showDialogVisible"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableDate" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column prop="attr_name" type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEidtDialogVisible(scope.row.attr_id)"
                >修改</el-button>
                <el-button size="mini" type="warning" icon="el-icon-delete"  @click="removeParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 主体内容区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改参数对话框  -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 主体内容区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // 被激活的页面的名称
      activeName: 'many',
      // 动态参数的数据
      manyTableDate: [],
      // 静态参数的数据
      onlyTableDate: [],
      // 控制添加参数对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加参数 验证表单规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 控制修改参数框的显示与隐藏
      editDialogVisible: false,
      // 修改参数表单数据对象
      editForm: {
        attr_name: ''
      },
      // 修改参数 验证表单规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    // 如果按钮需要被禁用，则返回true否则返回false
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三类id
    cateID () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态计算标题文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  },
  methods: {
    // 获取所有商品列表
    async getCateList () {
      const {
        data: { data, meta }
      } = await this.$http.get('categories')
      if (meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.cateList = data
      // console.log(this.cateList)
    },
    // 级联选择框选中项变化，会触发这个函数
    handleChange () {
      this.getParamsDate()
    },
    // tab页签点击事件的处理函数
    handleClick () {
      console.log(this.activeName)
      this.getParamsDate()
    },
    // 获取参数列表数据
    async getParamsDate () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        return
      }
      // 证明选中的是三级分类
      console.log(this.selectedCateKeys)
      // 根据所选分类的id和所处的面板，获取对应的数据
      const {
        data: { data, meta }
      } = await this.$http.get(`categories/${this.cateID}/attributes`, {
        params: { sel: this.activeName }
      })
      if (meta.status !== 200) return this.$message.error('获取参数列表失败')
      // console.log(data)
      if (this.activeName === 'many') {
        this.manyTableDate = data
      } else {
        this.onlyTableDate = data
      }
    },
    // 控制修改参数框的显示与隐藏
    showDialogVisible () {
      this.addDialogVisible = true
    },
    // 监听对话框关闭事件
    addDialogClosed () {
      // 关闭对话框，重置表单验证
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams () {
      // 发送ajax前，进行预验证
      this.$refs.addFormRef.validate(async valid => {
        // 如果不为真，直接return
        if (!valid) return
        // 为真，发送请求
        const {
          data: { data, meta }
        } = await this.$http.post(`categories/${this.cateID}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (meta.status !== 201) return this.$message.error('添加参数失败')
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsDate()
      })
      console.log(this.$refs.addFormRef)
    },
    // 控制修改参数框的显示与隐藏
    async showEidtDialogVisible (attr_id) {
      const {
        data: { data, meta }
      } = await this.$http.get(
        `categories/${this.cateID}/attributes/${attr_id}`,
        { params: { attr_sel: this.activeName } }
      )
      this.editDialogVisible = true
      if (meta.status !== 200) return this.$message.error('查询参数失败')
      this.editForm = data
    },
    // 监听修改参数对话框的关闭事件
    editDialogClosed () {
      // 重置验证表单
      this.$refs.editFormRef.resetFields()
    },
    // 点击按钮，修改参数
    editParams () {
      // 发送请求前，进行预验证
      this.$refs.editFormRef.validate(async valid => {
        // 如果不为真，直接return
        if (!valid) return
        const {
          data: { data, meta }
        } = await this.$http.put(
          `categories/${this.cateID}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (meta.status !== 200) return this.$message.error('修改参数失败')
        this.$message.success('修改参数成功')
        this.getParamsDate()
        this.editDialogVisible = false
      })
    },
    // 点击删除按钮，删除参数
    async removeParams (attrid) {
      try {
        await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // 调用接口发送请求
        const {
          data: { data, meta }
        } = await this.$http.delete(
          `categories/${this.cateID}/attributes/${attrid}`
        )
        if (meta.status !== 200) return this.$message.error('删除参数失败')
        this.$message.success('删除参数成功')
        this.getParamsDate()
      } catch (error) {
        this.$message.info('已取消删除')
      }
    }
  }
}
</script>
<style lang="less" scoped>
.el-alert {
  margin-bottom: 15px;
}
</style>
