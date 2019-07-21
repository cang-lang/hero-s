<template>
  <div class="rights">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域  -->
    <el-card>
      <!-- 获取列表 -->
      <el-table :data="rightsList" stripe border style="width: 100%">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="等级">
          <!-- 使用作用域插槽 -->
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      rightsList: []
    }
  },
  methods: {
    // 获取列表数据
    async getrightList () {
      const {
        data: { data, meta }
      } = await this.$http.get('rights/list')
      if (meta.status !== 200) return this.$message.error(meta.msg)
      this.rightsList = data
    }
  },
  created () {
    this.getrightList()
  }
}
</script>
<style lang="less" scoped>

</style>
