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
            <el-table 
              :data="dbcList" 
              style="width: 100%" 
              v-loading="loading"
              @row-click="handleRowClick"
              :row-class-name="() => 'clickable-row'"
            >
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
                    @click.stop="applyDbc(scope.row.name)"
                    :disabled="currentDbc === scope.row.name"
                  >
                    应用
                  </el-button>
                  <el-button 
                    size="small" 
                    type="warning" 
                    @click.stop="editDbc(scope.row)"
                  >
                    修改
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    @click.stop="deleteDbc(scope.row.name)"
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
    
    <!-- DBC Detail Dialog -->
    <el-dialog v-model="showDetailDialog" title="DBC文件详情" width="1000px">
      <div v-loading="detailLoading">
        <div v-if="dbcDetail" class="detail-content">
          <!-- 基本信息 -->
          <el-descriptions title="基本信息" :column="2" border>
            <el-descriptions-item label="文件名称">{{ dbcDetail.name }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{ dbcDetail.description || '无描述' }}</el-descriptions-item>
            <el-descriptions-item label="上传时间">{{ formatTime(dbcDetail.upload_time) }}</el-descriptions-item>
            <el-descriptions-item label="文件大小">{{ formatFileSize(dbcDetail.file_size) }}</el-descriptions-item>
            <el-descriptions-item label="源文件名">{{ dbcDetail.source_filename }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="currentDbc === dbcDetail.name ? 'success' : 'info'" size="small">
                {{ currentDbc === dbcDetail.name ? '当前使用' : '未使用' }}
              </el-tag>
            </el-descriptions-item>
              </el-descriptions>
          
          <!-- 信号版本管理 -->
          <div class="signal-version-section">
            <div class="section-header">
              <h3>信号版本管理</h3>
              <!-- <div class="version-actions">
                <el-button type="primary" size="small" @click="showSignalVersionDialog = true">
                  创建信号版本
                </el-button>
              </div> -->
      </div>
      
            <!-- 信号版本列表 -->
            <div v-if="signalVersions.length > 0" class="version-list">
              <el-table :data="signalVersions" size="small" style="width: 100%">
                <el-table-column prop="name" label="版本名称" width="150" />
                <el-table-column prop="description" label="描述" />
                <el-table-column label="信号数量" width="100">
                  <template #default="scope">
                    {{ scope.row.signals ? scope.row.signals.length : 0 }}
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="120">
                  <template #default="scope">
                    <el-tag 
                      :type="scope.row.current ? 'success' : 'info'"
                      size="small"
                    >
                      {{ scope.row.current ? '当前使用' : '未使用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button 
                      size="small" 
                      type="success" 
                      @click.stop="switchSignalVersion(scope.row.name)"
                      :disabled="scope.row.current"
                    >
                      应用
                    </el-button>
                    <el-button 
                      size="small" 
                      type="danger" 
                      @click.stop="deleteSignalVersion(scope.row.name)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
    </div>
            
            <div v-else class="empty-versions">
              <el-empty image-size="80" description="暂无信号版本" />
  </div>
          </div>
          
          <!-- 信号选择区域 -->
          <div class="signal-selection-section">
            <div class="section-header">
              <h3>信号选择</h3>
              <!-- <div class="tree-actions">
                <el-button 
                  size="small" 
                  @click="toggleAllNodes"
                >
                  {{ expandedKeys.length > 0 ? '折叠全部' : '展开全部' }}
                </el-button>
              </div> -->
            </div>
            <div class="selection-info">
              <span>已选择 {{ selectedSignals.length }} 个信号</span>
              <div class="selection-actions">
                <el-button 
                  size="small" 
                  type="primary"
                  @click.stop="showSaveCollectionDialog = true"
                  :disabled="selectedSignals.length === 0"
                >
                  保存为信号合集
                </el-button>
                <el-button 
                  v-if="selectedSignals.length > 0" 
                  size="small" 
                  @click.stop="clearSelectedSignals"
                >
                  清空选择
                </el-button>
              </div>
            </div>
            
            <div class="signal-tree-container">
              <el-tree
                ref="treeRef"
                :data="signalTreeData"
                show-checkbox
                node-key="id"
                :default-checked-keys="selectedSignals"
                :expanded-keys="expandedKeys"
                @check="handleSignalSelectionChange"
                :props="{
                  children: 'children',
                  label: 'label'
                }"
                :expand-on-click-node="false"
                :check-strictly="false"
                :default-expand-all="false"
                :check-on-click-node="false"
              >
                <template #default="{ node, data }">
                  <el-tooltip
                    v-if="hasNodeComment(data)"
                    :content="getNodeComment(data)"
                    :placement="getTooltipPlacement(data)"
                    :show-after="300"
                    :hide-after="0"
                    popper-class="signal-comment-tooltip"
                    :popper-options="{
                      modifiers: [
                        {
                          name: 'preventOverflow',
                          options: {
                            boundary: 'viewport',
                            padding: 12
                          }
                        },
                        {
                          name: 'flip',
                          options: {
                            fallbackPlacements: getTooltipFallbackPlacements(data)
                          }
                        }
                      ]
                    }"
                  >
                    <span 
                      class="custom-tree-node"
                      :class="{ 
                        'signal-node': data.id.startsWith('signal_'),
                        'message-node': data.id.startsWith('msg_')
                      }"
                    >
                      <i 
                        :class="getNodeIcon(data)" 
                        style="margin-right: 5px; color: #409eff;"
                      ></i>
                      <span>{{ node.label }}</span>
                      <!-- <span v-if="data.id.startsWith('signal_')" class="signal-info">
                        ({{ data.data?.signal?.start_bit || 0 }}:{{ data.data?.signal?.length || 0 }})
                      </span> -->
                      <i 
                        v-if="hasNodeComment(data)" 
                        class="el-icon-info" 
                        style="margin-left: 5px; color: #909399; font-size: 12px;"
                      ></i>
                    </span>
                  </el-tooltip>
                  <span 
                    v-else
                    class="custom-tree-node"
                    :class="{ 
                      'signal-node': data.id.startsWith('signal_'),
                      'message-node': data.id.startsWith('msg_')
                    }"
                  >
                    <i 
                      :class="getNodeIcon(data)" 
                      style="margin-right: 5px; color: #409eff;"
                    ></i>
                    <span>{{ node.label }}</span>
                    <!-- <span v-if="data.id.startsWith('signal_')" class="signal-info">
                      ({{ data.data?.signal?.start_bit || 0 }}:{{ data.data?.signal?.length || 0 }})
                    </span> -->
                  </span>
                </template>
              </el-tree>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- Create Signal Version Dialog -->
    <el-dialog v-model="showSignalVersionDialog" title="创建信号版本" width="600px">
      <el-form :model="signalVersionForm" label-width="100px">
        <el-form-item label="版本名称" required>
          <el-input v-model="signalVersionForm.name" placeholder="请输入版本名称" />
        </el-form-item>
        <el-form-item label="版本描述">
          <el-input 
            v-model="signalVersionForm.description" 
            type="textarea" 
            placeholder="请输入版本描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="已选信号">
          <div class="selected-signals-info">
            <span>已选择 {{ selectedSignals.length }} 个信号</span>
            <div v-if="selectedSignals.length > 0" class="selected-signals-list">
              <el-tag 
                v-for="signalId in selectedSignals" 
                :key="signalId"
                size="small"
                style="margin: 2px"
                type="info"
              >
                {{ getSignalDisplayName(signalId) }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSignalVersionDialog = false">取消</el-button>
          <el-button type="primary" @click="createSignalVersion">确认创建</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- Save Signal Collection Dialog -->
    <el-dialog v-model="showSaveCollectionDialog" title="保存信号合集" width="600px">
      <el-form :model="saveCollectionForm" label-width="100px">
        <el-form-item label="合集名称" required>
          <el-input v-model="saveCollectionForm.name" placeholder="请输入合集名称" />
        </el-form-item>
        <el-form-item label="合集描述">
          <el-input 
            v-model="saveCollectionForm.description" 
            type="textarea" 
            placeholder="请输入合集描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="已选信号">
          <div class="selected-signals-info">
            <span>已选择 {{ selectedSignals.length }} 个信号</span>
            <div v-if="selectedSignals.length > 0" class="selected-signals-list">
              <el-tag 
                v-for="signalId in selectedSignals" 
                :key="signalId"
                size="small"
                style="margin: 2px"
                type="info"
              >
                {{ getSignalDisplayName(signalId) }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSaveCollectionDialog = false">取消</el-button>
          <el-button type="primary" @click="saveSignalCollection">确认保存</el-button>
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
const detailLoading = ref(false)
const dbcDetail = ref(null)

// Signal version management
const signalTreeData = ref([])
const selectedSignals = ref([])
const signalVersions = ref([])
const currentSignalVersion = ref('')
const signalVersionForm = reactive({
  name: '',
  description: ''
})

const saveCollectionForm = reactive({
  name: '',
  description: ''
})
const treeRef = ref(null)
const expandedKeys = ref([])

// Dialog states
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDetailDialog = ref(false)
const showSignalVersionDialog = ref(false)
const showSaveCollectionDialog = ref(false)
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

// 获取DBC详情
const getDbcDetail = async (dbcName: string) => {
  detailLoading.value = true
  try {
    const response = await axios.get(`${API_BASE}/dbc/${dbcName}`)
    if (response.data.status === 200) {
      dbcDetail.value = response.data.data
      console.log('DBC数据结构:', response.data.data.dbc)
      // 构建信号树形数据 - 传递整个dbc对象
      signalTreeData.value = buildSignalTree(response.data.data.dbc)
      console.log('构建的树形数据:', signalTreeData.value)
      // 重置选中的信号
      selectedSignals.value = []
      // 重置展开的节点
      expandedKeys.value = []
      // 加载信号版本列表
      await loadSignalVersions(dbcName)
      showDetailDialog.value = true
    }
  } catch (error) {
    console.error('获取DBC详情失败:', error)
    ElMessage.error('获取DBC详情失败')
  } finally {
    detailLoading.value = false
  }
}

// 处理表格行点击
const handleRowClick = (row: any) => {
  getDbcDetail(row.name)
}

// 构建信号树形数据
const buildSignalTree = (dbcData: any) => {
  if (!dbcData) return []
  
  console.log('开始构建树形数据，输入数据:', dbcData)
  
  // 构建三层结构：DBC -> Messages -> Signals
  const result = Object.keys(dbcData).map(dbcName => {
    const dbcInfo = dbcData[dbcName]
    console.log(`处理DBC: ${dbcName}`, dbcInfo)
    
    const dbcNode = {
      id: `dbc_${dbcName}`,
      label: `${dbcName} (${dbcInfo.description || 'DBC文件'})`,
      children: []
    }
    
    if (dbcInfo.messages) {
      console.log(`DBC ${dbcName} 的messages:`, dbcInfo.messages)
      dbcNode.children = Object.keys(dbcInfo.messages).map(messageId => {
        const message = dbcInfo.messages[messageId]
        console.log(`处理消息 ${messageId}:`, message)
        
        const messageNode = {
          id: `msg_${messageId}`,
          label: `${message.name} (ID: ${messageId}, Size: ${message.size || message.length || 0})`,
          children: [],
          data: {
            dbcName: dbcName,
            messageId: messageId,
            messageName: message.name,
            message: message
          }
        }
        
        if (message.signals) {
          console.log(`消息 ${messageId} 的signals:`, message.signals)
          messageNode.children = Object.keys(message.signals).map(signalName => {
            const signal = message.signals[signalName]
            console.log(`处理信号 ${signalName}:`, signal)
            
            return {
              id: `signal_${messageId}_${signalName}`,
              label: `${signalName}`,
              data: {
                dbcName: dbcName,
                messageId: messageId,
                messageName: message.name,
                signal: signal
              }
            }
          })
        }
        
        return messageNode
      })
    }
    
    return dbcNode
  })
  
  console.log('构建完成的树形数据:', result)
  return result
}

// 加载信号版本列表
const loadSignalVersions = async (dbcName: string) => {
  try {
    const response = await axios.get(`${API_BASE}/dbc/${dbcName}/signal-collections`)
    if (response.data.status === 200) {
      // 获取当前使用的信号合集名称
      const currentCollectionName = await getCurrentSignalCollection(dbcName)
      
      // 为每个信号合集添加current字段
      signalVersions.value = response.data.data.map((collection: any) => ({
        ...collection,
        current: collection.name === currentCollectionName
      }))
      
      // 设置当前使用的信号合集名称
      currentSignalVersion.value = currentCollectionName || ''
      
      console.log('加载的信号版本数据:', signalVersions.value)
      console.log('当前使用的信号合集:', currentCollectionName)
    }
  } catch (error) {
    console.error('加载信号版本失败:', error)
  }
}

// 获取当前使用的信号合集名称
const getCurrentSignalCollection = async (dbcName: string) => {
  try {
    const response = await axios.get(`${API_BASE}/dbc/${dbcName}`)
    if (response.data.status === 200) {
      return response.data.data.currentSignalCollectionName || ''
    }
  } catch (error) {
    console.error('获取当前信号合集失败:', error)
  }
  return ''
}

// 创建信号版本
const createSignalVersion = async () => {
  if (!signalVersionForm.name.trim()) {
    ElMessage.error('请输入版本名称')
    return
  }
  
  if (selectedSignals.value.length === 0) {
    ElMessage.error('请选择至少一个信号')
    return
  }
  
  try {
    const signalData = selectedSignals.value.map(signalId => {
      // 解析信号ID: signal_${messageId}_${signalName}
      const parts = signalId.replace('signal_', '').split('_')
      const messageId = parts[0]
      const signalName = parts.slice(1).join('_') // 处理信号名中可能包含下划线的情况
      
      // 在DBC数据中查找对应的消息和信号
      let foundMessage = null
      let foundSignal = null
      let dbcName = ''
      
      // 遍历所有DBC对象
      for (const dbcKey in dbcDetail.value.dbc) {
        const dbcInfo = dbcDetail.value.dbc[dbcKey]
        if (dbcInfo.messages && dbcInfo.messages[messageId]) {
          foundMessage = dbcInfo.messages[messageId]
          if (foundMessage.signals && foundMessage.signals[signalName]) {
            foundSignal = foundMessage.signals[signalName]
            dbcName = dbcKey
            break
          }
        }
      }
      
      if (!foundMessage || !foundSignal) {
        console.error(`未找到信号: ${signalName} 在消息: ${messageId}`)
        return null
      }
      
      // 根据接口文档返回正确的数据结构
      return {
        nodeName: dbcName,
        messageName: foundMessage.name,
        signalName: signalName
      }
    }).filter(Boolean) // 过滤掉null值
    
    if (signalData.length === 0) {
      ElMessage.error('没有找到有效的信号数据')
      return
    }
    
    console.log('发送到API的信号版本数据:', {
      name: signalVersionForm.name,
      description: signalVersionForm.description,
      signals: signalData
    })
    
    const response = await axios.post(`${API_BASE}/dbc/${dbcDetail.value.name}/signal-collections`, {
      name: signalVersionForm.name,
      description: signalVersionForm.description,
      signals: signalData
    })
    
    if (response.data.status === 200) {
      ElMessage.success('信号版本创建成功')
      showSignalVersionDialog.value = false
      
      // 如果这是第一个信号版本，自动设置为当前使用
      if (signalVersions.value.length === 0) {
        await switchSignalVersion(signalVersionForm.name)
      } else {
        await loadSignalVersions(dbcDetail.value.name)
      }
      
      // Reset form
      signalVersionForm.name = ''
      signalVersionForm.description = ''
      // 清空选中的信号
      selectedSignals.value = []
      // 重置树的选中状态
      if (treeRef.value) {
        treeRef.value.setCheckedKeys([])
        console.log('创建版本后清空选中状态')
      }
    }
  } catch (error) {
    console.error('创建信号版本失败:', error)
    ElMessage.error('创建信号版本失败')
  }
}

// 切换信号版本
const switchSignalVersion = async (versionName: string) => {
  try {
    const response = await axios.put(`${API_BASE}/dbc/${dbcDetail.value.name}/signal-collections/current`, {
      name: versionName
    })
    
    if (response.data.status === 200) {
      currentSignalVersion.value = versionName
      
      // 更新信号合集列表中的current状态
      signalVersions.value = signalVersions.value.map((collection: any) => ({
        ...collection,
        current: collection.name === versionName
      }))
      
      ElMessage.success('信号版本切换成功')
    }
  } catch (error) {
    console.error('切换信号版本失败:', error)
    ElMessage.error('切换信号版本失败')
  }
}

// 删除信号版本
const deleteSignalVersion = async (versionName: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除信号版本 "${versionName}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await axios.delete(`${API_BASE}/dbc/${dbcDetail.value.name}/signal-collections/${versionName}`)
    if (response.data.status === 200) {
      ElMessage.success('删除成功')
      
      // 如果删除的是当前使用的版本，清空当前版本
      if (currentSignalVersion.value === versionName) {
        currentSignalVersion.value = ''
      }
      
      // 重新加载信号版本列表
      await loadSignalVersions(dbcDetail.value.name)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除信号版本失败:', error)
      ElMessage.error('删除信号版本失败')
    }
  }
}

// 处理信号选择变化
const handleSignalSelectionChange = (data: any, checkedInfo: any) => {
  console.log('选择变化事件参数:', { data, checkedInfo })
  
  // Element Plus el-tree 的 @check 事件传递的参数格式
  // checkedInfo 包含 { checkedKeys, checkedNodes, halfCheckedKeys, halfCheckedNodes }
  if (checkedInfo && checkedInfo.checkedKeys) {
    // 只选择信号节点，过滤掉 DBC 和消息节点
    const signalKeys = checkedInfo.checkedKeys.filter((key: string) => key.startsWith('signal_'))
    selectedSignals.value = signalKeys
    console.log('选中的信号节点:', signalKeys)
    console.log('选中的节点总数:', checkedInfo.checkedKeys.length, '信号节点数:', signalKeys.length)
  } else {
    selectedSignals.value = []
  }
}

// 获取信号的显示名称
const getSignalDisplayName = (signalId: string) => {
  if (!signalId.startsWith('signal_')) return signalId
  
  const parts = signalId.replace('signal_', '').split('_')
  const messageId = parts[0]
  const signalName = parts.slice(1).join('_')
  
  // 在树形数据中查找对应的标签
  for (const dbcNode of signalTreeData.value) {
    for (const msgNode of dbcNode.children || []) {
      if (msgNode.id === `msg_${messageId}`) {
        for (const signalNode of msgNode.children || []) {
          if (signalNode.id === signalId) {
            return `${signalName} (${messageId})`
          }
        }
      }
    }
  }
  
  return signalName
}

// 获取节点图标
const getNodeIcon = (data: any) => {
  if (data.id.startsWith('dbc_')) {
    return 'el-icon-folder-opened'
  } else if (data.id.startsWith('msg_')) {
    return 'el-icon-document'
  } else if (data.id.startsWith('signal_')) {
    return 'el-icon-connection'
  }
  return 'el-icon-document'
}

// 检查节点是否有comment
const hasNodeComment = (data: any) => {
  if (data.id.startsWith('signal_')) {
    return data.data?.signal?.comment && data.data.signal.comment.trim() !== ''
  } else if (data.id.startsWith('msg_')) {
    return data.data?.message?.comment && data.data.message.comment.trim() !== ''
  }
  return false
}

// 获取节点的comment
const getNodeComment = (data: any) => {
  if (data.id.startsWith('signal_')) {
    return data.data?.signal?.comment || ''
  } else if (data.id.startsWith('msg_')) {
    return data.data?.message?.comment || ''
  }
  return ''
}

// 获取tooltip的最佳位置
const getTooltipPlacement = (data: any) => {
  // 根据节点类型和位置智能选择
  if (data.id.startsWith('signal_')) {
    // 信号节点优先使用top，如果靠近屏幕顶部则使用bottom
    return 'top'
  } else if (data.id.startsWith('msg_')) {
    // 消息节点使用top
    return 'top'
  }
  return 'top'
}

// 获取tooltip的备选位置
const getTooltipFallbackPlacements = (data: any) => {
  if (data.id.startsWith('signal_')) {
    return ['top', 'bottom', 'left', 'right']
  } else if (data.id.startsWith('msg_')) {
    return ['top', 'bottom']
  }
  return ['top']
}

// 保存信号合集
const saveSignalCollection = async () => {
  if (!saveCollectionForm.name.trim()) {
    ElMessage.error('请输入合集名称')
    return
  }
  
  if (selectedSignals.value.length === 0) {
    ElMessage.error('请选择至少一个信号')
    return
  }
  
  try {
    const signalData = selectedSignals.value.map(signalId => {
      // 解析信号ID: signal_${messageId}_${signalName}
      const parts = signalId.replace('signal_', '').split('_')
      const messageId = parts[0]
      const signalName = parts.slice(1).join('_') // 处理信号名中可能包含下划线的情况
      
      // 在DBC数据中查找对应的消息和信号
      let foundMessage = null
      let foundSignal = null
      let dbcName = ''
      
      // 遍历所有DBC对象
      for (const dbcKey in dbcDetail.value.dbc) {
        const dbcInfo = dbcDetail.value.dbc[dbcKey]
        if (dbcInfo.messages && dbcInfo.messages[messageId]) {
          foundMessage = dbcInfo.messages[messageId]
          if (foundMessage.signals && foundMessage.signals[signalName]) {
            foundSignal = foundMessage.signals[signalName]
            dbcName = dbcKey
            break
          }
        }
      }
      
      if (!foundMessage || !foundSignal) {
        console.error(`未找到信号: ${signalName} 在消息: ${messageId}`)
        return null
      }
      
      // 根据接口文档返回正确的数据结构
      return {
        nodeName: dbcName,
        messageName: foundMessage.name,
        signalName: signalName
      }
    }).filter(Boolean) // 过滤掉null值
    
    if (signalData.length === 0) {
      ElMessage.error('没有找到有效的信号数据')
      return
    }
    
    console.log('发送到API的信号合集数据:', {
      name: saveCollectionForm.name,
      description: saveCollectionForm.description,
      signals: signalData
    })
    
    const response = await axios.post(`${API_BASE}/dbc/${dbcDetail.value.name}/signal-collections`, {
      name: saveCollectionForm.name,
      description: saveCollectionForm.description,
      signals: signalData
    })
    
    if (response.data.status === 200) {
      ElMessage.success('信号合集保存成功')
      showSaveCollectionDialog.value = false
      
      // 如果这是第一个信号合集，自动设置为当前使用
      if (signalVersions.value.length === 0) {
        await switchSignalVersion(saveCollectionForm.name)
      } else {
        await loadSignalVersions(dbcDetail.value.name)
      }
      
      // Reset form
      saveCollectionForm.name = ''
      saveCollectionForm.description = ''
      // 清空选中的信号
      selectedSignals.value = []
      // 重置树的选中状态
      if (treeRef.value) {
        treeRef.value.setCheckedKeys([])
        console.log('保存合集后清空选中状态')
      }
    }
  } catch (error) {
    console.error('保存信号合集失败:', error)
    ElMessage.error('保存信号合集失败')
  }
}

// 清空选中的信号
const clearSelectedSignals = () => {
  selectedSignals.value = []
  if (treeRef.value) {
    treeRef.value.setCheckedKeys([])
    console.log('已清空选中的信号')
  }
}

// 展开/折叠所有节点
const toggleAllNodes = () => {
  if (expandedKeys.value.length > 0) {
    expandedKeys.value = []
  } else {
    // 展开所有节点
    const allKeys = []
    const collectKeys = (nodes: any[]) => {
      nodes.forEach(node => {
        allKeys.push(node.id)
        if (node.children && node.children.length > 0) {
          collectKeys(node.children)
        }
      })
    }
    collectKeys(signalTreeData.value)
    expandedKeys.value = allKeys
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

// 可点击行样式
::v-deep .clickable-row {
  cursor: pointer;
  
  &:hover {
    background-color: #f0f9ff !important;
  }
}

// 详情弹窗样式
.detail-content {
  .signal-version-section {
    margin-top: 20px;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      h3 {
        color: #303133;
        margin: 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #409eff;
      }
      
      .version-actions {
        display: flex;
        gap: 10px;
      }
    }
    
    .version-list {
      margin-bottom: 20px;
    }
    
    .empty-versions {
      text-align: center;
      padding: 20px;
      color: #909399;
    }
  }
  
  .signal-selection-section {
    margin-top: 20px;
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      
      h3 {
        color: #303133;
        margin: 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #409eff;
      }
      
      .tree-actions {
        display: flex;
        gap: 10px;
      }
    }
    
    .selection-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding: 10px;
      background-color: #f5f7fa;
      border-radius: 4px;
      
      span {
        color: #606266;
        font-weight: 500;
      }
      
      .selection-actions {
        display: flex;
        gap: 8px;
      }
    }
    
    .signal-tree-container {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      padding: 10px;
      
      ::v-deep .el-tree {
        background: none;
        
        .el-tree-node__content {
          height: 32px;
          
          &:hover {
            background-color: #f0f9ff;
          }
        }
        
        .el-tree-node.is-current > .el-tree-node__content {
          background-color: #ecf5ff;
        }
        
        .custom-tree-node {
          display: flex;
          align-items: center;
          width: 100%;
          
          .signal-info {
            margin-left: 8px;
            color: #909399;
            font-size: 12px;
          }
          
          &.signal-node,
          &.message-node {
            cursor: pointer;
            
            &:hover {
              background-color: #f0f9ff;
              border-radius: 4px;
              padding: 2px 4px;
              margin: -2px -4px;
            }
          }
          
          &.signal-node {
            &:hover {
              background-color: #f0f9ff;
            }
          }
          
          &.message-node {
            &:hover {
              background-color: #f5f7fa;
            }
          }
        }
        
        // 自定义tooltip样式
        ::v-deep .el-tooltip__popper {
          max-width: 300px;
          word-wrap: break-word;
          white-space: pre-wrap;
          line-height: 1.4;
          
          .el-tooltip__content {
            font-size: 12px;
            color: #606266;
          }
        }
        
        // 信号comment tooltip专用样式
        ::v-deep .signal-comment-tooltip {
          max-width: 400px !important;
          min-width: 250px !important;
          
          .el-tooltip__content {
            font-size: 13px !important;
            color: #303133 !important;
            line-height: 1.6 !important;
            padding: 10px 14px !important;
            background-color: #ffffff !important;
            border: 1px solid #dcdfe6 !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15) !important;
            font-weight: 400 !important;
            word-break: break-word !important;
            white-space: pre-wrap !important;
          }
          
          .el-tooltip__arrow {
            border-top-color: #dcdfe6 !important;
            
            &::before {
              border-top-color: #ffffff !important;
            }
          }
          
          // 为不同位置调整箭头样式
          &[x-placement^="top"] .el-tooltip__arrow {
            border-top-color: #dcdfe6 !important;
            
            &::before {
              border-top-color: #ffffff !important;
            }
          }
          
          &[x-placement^="left"] .el-tooltip__arrow {
            border-left-color: #dcdfe6 !important;
            
            &::before {
              border-left-color: #ffffff !important;
            }
          }
        }
        
        // 不同层级的不同样式
        .el-tree-node[data-level="1"] .el-tree-node__content {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        
        .el-tree-node[data-level="2"] .el-tree-node__content {
          background-color: #fafbfc;
          font-weight: 500;
        }
        
        .el-tree-node[data-level="3"] .el-tree-node__content {
          background-color: #ffffff;
        }
      }
    }
  }
}

// 创建版本弹窗样式
.selected-signals-info {
  .selected-signals-list {
    margin-top: 10px;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 10px;
    background-color: #f9f9f9;
  }
}
</style>