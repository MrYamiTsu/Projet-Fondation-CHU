import { defineStore, acceptHMRUpdate } from "pinia";
import { ref, computed } from "vue";

const API_URL = `http://0.0.0.0:3000/emplacements`;

export const usePlotsStore = defineStore("plots", () => {
  const plots = ref([]);
  const plot = ref();
  const isLoading = ref(false);
  const errorMessage = ref("");

  const totalPlots = computed(() => plots.value.length);
  const availablePlots = computed(
    () => plots.value.filter((p) => p.available).length,
  );
  const reservedPlots = computed(
    () => plots.value.filter((p) => !p.available).length,
  );
  const totalValuation = computed(() =>
    plots.value.reduce((acc, p) => acc + (Number(p.price) || 0), 0),
  );

  function formatPrice(amount) {
    return `${new Intl.NumberFormat("fr-CA").format(amount)} $ CAD`;
  }

  async function getPlots() {
    isLoading.value = true;
    errorMessage.value = "";
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      plots.value = data;
    } catch (error) {
      errorMessage.value = error.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function getPlotById(id) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      plot.value = data;
    } catch (error) {
      errorMessage.value = error.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function RechercherPlots(lieu) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
      const res = await fetch(
        `${API_URL}/recherche?lieu=${lieu}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      plots.value = data;
    } catch (error) {
      errorMessage.value = error.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function addPlot(plotData) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(plotData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      plots.value.unshift(data.data.emplacement);
    } catch (error) {
      errorMessage.value = error.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function updatePlot(id, plotData) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(plotData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const index = plots.value.findIndex((p) => p.id === Number(id));
      if (index !== -1) plots.value[index] = data.data.emplacement;
    } catch (error) {
      errorMessage.value = error.message;
    } finally {
      isLoading.value = false;
    }
  }

  async function toggleAvailability(id) {
    const item = plots.value.find((p) => p.id === Number(id));
    if (!item) return;
    await updatePlot(id, { ...item, available: !item.available });
  }

  async function deletePlot(id) {
    isLoading.value = true;
    errorMessage.value = "";
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      plots.value = plots.value.filter((p) => p.id !== Number(id));
    } catch (error) {
      errorMessage.value = error.message;
    } finally {
      isLoading.value = false;
    }
  }

  if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(usePlotsStore, import.meta.hot));
  }

  return {
    plots,
    plot,
    isLoading,
    errorMessage,
    totalPlots,
    availablePlots,
    reservedPlots,
    totalValuation,
    formatPrice,
    getPlots,
    getPlotById,
    RechercherPlots,
    addPlot,
    updatePlot,
    toggleAvailability,
    deletePlot,
  };
});