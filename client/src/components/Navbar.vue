<template>
  <header class="navbar">
    <div class="logo-div">
      <div class="logo-chu">CHU Logo</div>
      <div class="logo-appli">App Logo</div>
    </div>

    <div class="search-section">
      <span class="search-icon">🔍</span>
      <input type="text" placeholder="Rechercher ..." />
    </div>

    <button class="connexion-btn">Connexion</button>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #e2e8f0;
  gap: 20px;
}

.logo-div {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-chu,
.logo-appli {
  font-weight: 600;
  color: #1e293b;
  background: #f1f5f9;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.search-section {
  position: relative;
  flex: 1;
  max-width: 500px;
}

.search-section input {
  width: 100%;
  padding: 10px 16px 10px 38px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s;
  background: #f8fafc;
}

.search-section input:focus {
  border-color: #0284c7;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
}

.connexion-btn {
  padding: 10px 20px;
  background: #0284c7;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.connexion-btn:hover {
  background: #0369a1;
}
</style>
