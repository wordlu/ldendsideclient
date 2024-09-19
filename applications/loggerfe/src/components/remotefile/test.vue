<template>
  <div class="remote-file">
    <div class="remote-form">
      <div class="remote-form-item">
        <label for="name">Name:</label>
        <input class="remote-form-input" @input="search($event)" v-model="name" id="name" type="text" placeholder="Enter your name" />
      </div>
      
      <div class="remote-form-item">
        <label for="option">Option:</label>
        <select class="remote-form-select" v-model="option" id="option" @change="getDepartData">
          <option value="12312321">123123</option>
          <option value="大师傅大师傅">法大师傅十分</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      name: '2222',
      option: 'Option 1',
    };
  },
  mounted() {
  },
  methods: {
    search(event){
      console.log(event.currentTarget.value)
      this.name = event.currentTarget.value
    },
    getDepartData(value) {
      console.log(event.target.value)
      this.option = event.target.value
    },
    getFormData() {
      return {
        name: this.name,
        option: this.option,
      };
    },
  },
};
</script>

<style scoped>
/* Add some basic styles */

.remote-file {
  height: 100%;
  width: 100%;
  padding: 10px;
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
  width: 80px;
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 0;
  box-sizing: border-box;
  font-weight: 400;
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
  width: 100%;
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
  width: 100%;
}

</style>

