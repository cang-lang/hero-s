<template>
  <div class="roles">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary">创建角色</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="rolesList" stripe border style="width:100%">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-row
              v-for="(item1,i1) in scope.row.children "
              :key="item1.id"
              :class="['bdbottom',{'bdtop':i1==0},'vcenter']"
            >
              <!-- 一级列表 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级三级列表 -->
              <el-col :span="19">
                <!--二级列表 -->
                <el-row
                  v-for="(item2,i2) in item1.children "
                  :key="item2.id"
                  :class="[i2==0?'':'bdtop','vcenter']"
                >
                  <el-col :span="5">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级列表 -->
                  <el-col :span="19">
                    <el-tag
                      type="warning"
                      v-for="(item3,i3) in item2.children "
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色权限"></el-table-column>
        <el-table-column label="操作" width="340px">
          <template slot-scope="scope">
            <!-- 编辑按钮 -->
            <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" @click="removeUserById(scope.row.id)">删除</el-button>
            <!-- 文字提示 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!--树形结构 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点id数据集合
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: ''
    }
  },
  created () {
    this.getrolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getrolesList () {
      const {
        data: { data, meta }
      } = await this.$http.get('roles')
      if (meta.status !== 200) return this.$message.error(meta.msg)
      this.rolesList = data
      // console.log(this.rolesList)
    },
    // 根据ID删除对应的权限
    async removeRightById (role, rightId) {
      // console.log(role.id)
      try {
        // 弹框提示是否需要删除
        const res = await this.$confirm(
          '此操作将永久删除该文件, 是否继续?',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        const {
          data: { data, meta }
        } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (meta.status !== 200) return this.$message.error('删除权限失败')
        // console.log(data)
        role.children = data
        // console.log(res)  //confirm
      } catch (error) {
        this.$message.info('取消删除')
        // console.log('取消') //取消
      }
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      // 把分配权限的角色id存入roleId中
      this.roleId = role.id
      // 获取树状型数据
      const {
        data: { data, meta }
      } = await this.$http.get('rights/tree')
      this.rightslist = data
      console.log(this.rightslist)
      console.log(role)

      // 调用默认角色选中的id函数

      this.getLeafKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys (node, arr) {
      // 如果节点不包含children属性，说明是三级节点，并且把三级节点的id追加到数组中。
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果不是三级节点，需要递归遍历数组拿到id。
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击确定按钮为角色分配角色
    async allotRights () {
      // 获取到分配权限对应的全选中以及半选中的id，并合成一个数组。
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      // console.log(keys)
      // 把合并成的数组，转换为字符串，用,分割
      const idStr = keys.join(',')
      // 发送axios
      const { data: { data, meta } } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      // 重新加载权限页面
      this.getrolesList()
      // 关闭权限分配对话框
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
