<template>
  <div class="container">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item>系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>DBC管理</el-breadcrumb-item>
    </el-breadcrumb>
    
    <div class="panel">
      <div class="title-panel">
        <div class="info">
          <div class="info-detail">
            <b>DBC管理</b>
          </div>
        </div>
      </div>
      
      <div class="content-area">
        <!-- DBC Version Management Section -->
        <div class="section">
          <div class="section-header">
            <!-- <div class="section-title">dbc 版本管理</div> -->
            <div class="section-actions">
              <el-button type="primary" @click="showAddDialog = true">
                <el-icon><Plus /></el-icon>
                新增 dbc
              </el-button>
            </div>
          </div>
          
          <div class="table-container">
            <el-table :data="dbcList" style="width: 100%" v-loading="loading">
              <el-table-column prop="name" label="文件名称" width="200" />
              <el-table-column prop="description" label="描述" />
              <el-table-column prop="upload_time" label="上传时间" width="180">
                <template #default="scope">
                  {{ formatTime(scope.row.upload_time) }}
                </template>
              </el-table-column>
              <el-table-column prop="file_size" label="文件大小" width="120">
                <template #default="scope">
                  {{ formatFileSize(scope.row.file_size) }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="scope">
                  <el-tag 
                    :type="currentDbc === scope.row.name ? 'success' : 'info'"
                    size="small"
                  >
                    {{ currentDbc === scope.row.name ? '当前使用' : '未使用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button 
                    size="small" 
                    type="success" 
                    @click="applyDbc(scope.row.name)"
                    :disabled="currentDbc === scope.row.name"
                  >
                    应用
                  </el-button>
                  <el-button 
                    size="small" 
                    type="warning" 
                    @click="editDbc(scope.row)"
                  >
                    修改
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    @click="deleteDbc(scope.row.name)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add DBC Dialog -->
    <el-dialog v-model="showAddDialog" title="新增DBC文件" width="500px">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="文件名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入DBC文件名称" />
        </el-form-item>
        <el-form-item label="文件描述" prop="description">
          <el-input v-model="addForm.description" type="textarea" placeholder="请输入文件描述" />
        </el-form-item>
        <el-form-item label="DBC文件" prop="file">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            accept=".dbc"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">只能上传 .dbc 文件</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="submitAddDbc" :loading="uploading">
            确认上传
          </el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- Edit DBC Dialog -->
    <el-dialog v-model="showEditDialog" title="修改DBC文件" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="文件名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入DBC文件名称" />
        </el-form-item>
        <el-form-item label="文件描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" placeholder="请输入文件描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="submitEditDbc">确认修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ArrowRight, Plus } from "@element-plus/icons-vue"
import { ref, reactive, onMounted } from "vue"
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

// Data
const dbcList = ref([])
const currentDbc = ref('')
const loading = ref(false)

// Dialog states
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const uploading = ref(false)

// Form refs
const addFormRef = ref()
const editFormRef = ref()
const uploadRef = ref()

// Forms
const addForm = reactive({
  name: '',
  description: '',
  file: null
})

const editForm = reactive({
  name: '',
  description: '',
  originalName: ''
})

// Validation rules
const addRules = {
  name: [
    { required: true, message: '请输入文件名称', trigger: 'blur' }
  ],
  file: [
    { required: true, message: '请选择DBC文件', trigger: 'change' }
  ]
}

const editRules = {
  name: [
    { required: true, message: '请输入文件名称', trigger: 'blur' }
  ]
}

// API base URL - 使用相对路径通过代理访问
const API_BASE = '/can_parser'

// Utility functions
const formatTime = (timeStr: string) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Methods
const loadDbcList = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_BASE}/dbc`)
    if (response.data.status === 200) {
      dbcList.value = response.data.data
    }
  } catch (error) {
    console.error('加载DBC列表失败:', error)
    ElMessage.error('加载DBC列表失败')
  } finally {
    loading.value = false
  }
}

const loadCurrentDbc = async () => {
  try {
    const response = await axios.get(`${API_BASE}/dbc/current`)
    if (response.data.status === 200) {
      currentDbc.value = response.data.data
    }
  } catch (error) {
    console.error('获取当前DBC失败:', error)
  }
}

const applyDbc = async (dbcName: string) => {
  try {
    const response = await axios.put(`${API_BASE}/dbc/current`, {
      name: dbcName
    })
    if (response.data.status === 200) {
      currentDbc.value = dbcName
      ElMessage.success('DBC应用成功')
    }
  } catch (error) {
    console.error('应用DBC失败:', error)
    ElMessage.error('应用DBC失败')
  }
}

const editDbc = (dbc: any) => {
  editForm.name = dbc.name
  editForm.description = dbc.description || ''
  editForm.originalName = dbc.name
  showEditDialog.value = true
}

const deleteDbc = async (dbcName: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除DBC文件 "${dbcName}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await axios.delete(`${API_BASE}/dbc/${dbcName}`)
    if (response.data.status === 200) {
      ElMessage.success('删除成功')
      await loadDbcList()
      if (currentDbc.value === dbcName) {
        currentDbc.value = ''
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除DBC失败:', error)
      ElMessage.error('删除DBC失败')
    }
  }
}

const handleFileChange = (file: any) => {
  addForm.file = file.raw
}

const submitAddDbc = async () => {
  if (!addFormRef.value) return
  
  try {
    await addFormRef.value.validate()
    
    if (!addForm.file) {
      ElMessage.error('请选择DBC文件')
      return
    }
    
    uploading.value = true
    
    const formData = new FormData()
    formData.append('file', addForm.file)
    formData.append('name', addForm.name)
    formData.append('description', addForm.description)
    
    const response = await axios.post(`${API_BASE}/dbc`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.data.status === 200) {
      ElMessage.success('DBC文件上传成功')
      showAddDialog.value = false
      await loadDbcList()
      
      // Reset form
      addForm.name = ''
      addForm.description = ''
      addForm.file = null
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
    }
  } catch (error) {
    console.error('上传DBC失败:', error)
    ElMessage.error('上传DBC失败')
  } finally {
    uploading.value = false
  }
}

const submitEditDbc = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    
    const response = await axios.put(`${API_BASE}/dbc/${editForm.originalName}`, {
      name: editForm.name,
      description: editForm.description
    })
    
    if (response.data.status === 200) {
      ElMessage.success('修改成功')
      showEditDialog.value = false
      await loadDbcList()
      
      // Update current DBC name if it was the edited one
      if (currentDbc.value === editForm.originalName) {
        currentDbc.value = editForm.name
      }
    }
  } catch (error) {
    console.error('修改DBC失败:', error)
    ElMessage.error('修改DBC失败')
  }
}

// Initialize
onMounted(async () => {
  await loadDbcList()
  await loadCurrentDbc()
})
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  margin: 0 30px;

  .bread-font {
    font-weight: 700;
  }

  .panel {
    margin-top: 15px;
    flex-grow: 1;
    border: 1px solid transparent;
  }

  .title-panel {
    background-color: white;
    display: flex;
    flex-direction: row;
    border-bottom: 1px solid #e4e7ed;
    
    .info {
      padding: 15px;
      width: 100%;
      display: flex;
      flex-direction: row;

      .info-detail {
        display: flex;
        flex-direction: column;

        b {
          display: flex;
          font-size: 18px;
          color: #303133;
        }
      }
    }
  }

  .content-area {
    background-color: white;
    padding: 20px;
    
    .section {
      margin-bottom: 30px;
      
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          padding-bottom: 10px;
          border-bottom: 2px solid #409eff;
        }
        
        .section-actions {
          display: flex;
          gap: 10px;
        }
      }
      
      .table-container {
        .el-table {
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          
          ::v-deep .el-table__header {
            background-color: #f5f7fa;
          }
          
          ::v-deep .el-table__row {
            &:hover {
              background-color: #f5f7fa;
            }
          }
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>