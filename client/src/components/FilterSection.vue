<template>
  <div class="filter-container">
    <h3>Filtre</h3>
    <div class="filter-box">Par Dates</div>
    <div class="filter-box">Par prix</div>
    <div class="filter-box">Par dimension</div>
  </div>
</template>

<style scoped>
.filter-container {
  border: 2px solid #666;
  padding: 16px;
  border-radius: 8px;
  background: #fafafa;
}
h3 {
  text-align: center;
  margin-top: 0;
  margin-bottom: 16px;
}
.filter-box {
  border: 2px dashed #999;
  padding: 12px;
  text-align: center;
  margin-bottom: 12px;
  border-radius: 6px;
  background: #fff;
}
.filter-box:last-child {
  margin-bottom: 0;
}
</style>
