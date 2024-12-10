<!-- ouster -->
<template>
  <div class="remote-file">
    <div class="remote-form">
      <div class="remote-form-item">
        <label for="host_name">设备地址:</label>
        <input class="remote-form-input" @input="setInput($event, 'host_name')" v-model="host_name" type="text" placeholder="请输入" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      "a.yaml/host_name": '',
    };
  },
  mounted() {
  },
  methods: {
    setInput(event, key){
      console.log(event.currentTarget.value)
      this[key] = event.currentTarget.value
    },
    setSelect(value, key) {
      console.log(event.target.value)
      this[key] = event.target.value
    },
    validFormData() {
      function isValidPort(port) {
        const portNumber = parseInt(port, 10);
        return portNumber >= 1025 && portNumber <= 65535;
      }
      let errmsg = ''
      if (!isValidPort(this.msop_port)) {
        errmsg = "请输入正确的msop包端口"
      } else if (!isValidPort(this.difop_port)) {
        errmsg = "请输入正确的difop包端口"
      }
      return errmsg
    },
    validFormData() {
      function isValidIP(ip) {
        const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Pattern.test(ip);
      }
      let errmsg = ''
      if (!isValidIP(this.host_name)) {
        errmsg = "请输入正确的设备地址"
      }
      return errmsg
    },
    getFormData() {
      return {
        host_name: this.host_name,
      };
    },
  },
};
</script>

<style>

.remote-file {
  height: 100%;
  width: 100%;
  /* padding: 10px; */
}
.remote-form {
  display: flex;
  flex-direction: column;
}

.remote-form .remote-form-item {
  display: flex;
  align-items: center;
  margin-bottom: 22px;
}

.remote-form .remote-form-item label {
  width: 110px;
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 0;
  box-sizing: border-box;
  font-weight: 700;
  text-wrap: nowrap;
}

.remote-form-input {
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  width: 300px;
  font-size: 14px;
  height: 32px;
}

.remote-form-select {
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  width: 300px;
  font-size: 14px;
  height: 32px;
}
</style>

