<template>
  <div class="hospital-selector">
    <select>
      <option disabled value="">Sélectionner un hôpital</option>
      <option>Hôpital Général</option>
      <option>Centre Universitaire</option>
    </select>
  </div>
</template>

<style scoped>
.hospital-selector {
  border: 2px dashed #999;
  padding: 12px;
  text-align: center;
  margin-bottom: 16px;
  border-radius: 6px;
}
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
