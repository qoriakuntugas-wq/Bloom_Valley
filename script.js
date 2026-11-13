const crops = {
  carrot: {
    name: "Carrot",
    emoji: "🥕",
    seedEmoji: "🥕",
    cost: 10,
    sell: 25,
    time: 15
  },
  strawberry: {
    name: "Strawberry",
    emoji: "🍓",
    seedEmoji: "🍓",
    cost: 20,
    sell: 50,
    time: 25
  },
  tomato: {
    name: "Tomato",
    emoji: "🍅",
    seedEmoji: "🍅",
    cost: 35,
    sell: 85,
    time: 35
  },
  sunflower: {
    name: "Sunflower",
    emoji: "🌻",
    seedEmoji: "🌻",
    cost: 50,
    sell: 120,
    time: 45
  },
  watermelon: {
    name: "Watermelon",
    emoji: "🍉",
    seedEmoji: "🍉",
    cost: 80,
    sell: 200,
    time: 60
  }
};

let coins = 100;
let mode = "plant";
let selectedSeed = "carrot";

let seedInventory = {
  carrot: 5,
  strawberry: 0,
  tomato: 0,
  sunflower: 0,
  watermelon: 0
};

let harvestInventory = {};

let garden = Array.from({ length: 20 }, () => null);

function notify(message) {
  document.getElementById("message").textContent = message;
}

function setMode(newMode) {
  mode = newMode;

  document.querySelectorAll(".buttons button").forEach(b => {
    b.classList.remove("selected");
  });

  document.getElementById(newMode + "Btn").classList.add("selected");

  document.getElementById("modeText").textContent =
    "Mode: " + newMode.toUpperCase();

  notify("Mode changed to " + newMode + "!");
}

function selectSeed(seed) {
  selectedSeed = seed;
  setMode("plant");
  renderSeeds();
  notify(crops[seed].name + " selected! 🌱");
}

function plant(index) {
  if (garden[index]) {
    notify("Petak ini sudah terisi!");
    return;
  }

  if (seedInventory[selectedSeed] <= 0) {
    notify("Benih tidak cukup! Beli di Seed Shop.");
    return;
  }

  seedInventory[selectedSeed]--;

  garden[index] = {
    type: selectedSeed,
    growth: 0,
    watered: false
  };

  notify(crops[selectedSeed].name + " berhasil ditanam! 🌱");
  renderAll();
}

function water(index) {
  const plant = garden[index];

  if (!plant) {
    notify("Belum ada tanaman di sini!");
    return;
  }

  if (plant.growth >= 100) {
    notify("Tanaman sudah siap dipanen!");
    return;
  }

  if (plant.watered) {
    notify("Tanaman ini sudah disiram!");
    return;
  }

  plant.watered = true;

  // Watering adds bonus growth
  plant.growth = Math.min(100, plant.growth + 20);

  notify("Tanaman berhasil disiram! 💧");
  renderAll();
}

function harvest(index) {
  const plant = garden[index];

  if (!plant) {
    notify("Tidak ada tanaman untuk dipanen!");
    return;
  }

  if (plant.growth < 100) {
    notify("Tanaman belum matang! Tunggu sampai 100%.");
    return;
  }

  const type = plant.type;

  harvestInventory[type] =
    (harvestInventory[type] || 0) + 1;

  garden[index] = null;

  notify(crops[type].name + " berhasil dipanen! 🎉");
  renderAll();
}

function clickPlot(index) {
  if (mode === "plant") plant(index);
  else if (mode === "water") water(index);
  else if (mode === "harvest") harvest(index);
}

function renderGarden() {
  const container = document.getElementById("garden");
  container.innerHTML = "";

  garden.forEach((plant, index) => {
    const plot = document.createElement("button");
    plot.className = "plot";
    plot.type = "button";

    if (!plant) {
      plot.innerHTML = "🟫<small>Empty</small>";
    } else {
      const crop = crops[plant.type];

      let emoji;

      if (plant.growth < 35) emoji = "🌱";
      else if (plant.growth < 70) emoji = "🌿";
      else if (plant.growth < 100) emoji = "🪴";
      else emoji = crop.emoji;

      plot.innerHTML = `
        ${emoji}
        <small>${crop.name}</small>
        <small>${Math.floor(plant.growth)}%</small>
        ${plant.watered ? "<small>💧</small>" : ""}
      `;
    }

    plot.onclick = () => clickPlot(index);
    container.appendChild(plot);
  });
}

function renderSeeds() {
  const container = document.getElementById("seedSelection");
  container.innerHTML = "";

  Object.entries(crops).forEach(([key, crop]) => {
    const button = document.createElement("button");
    button.className = "seed";

    if (selectedSeed === key) button.classList.add("selected");

    button.innerHTML =
      `${crop.seedEmoji} ${crop.name} (${seedInventory[key]})`;

    button.onclick = () => selectSeed(key);
    container.appendChild(button);
  });
}

function renderShop() {
  const container = document.getElementById("shop");
  container.innerHTML = "";

  Object.entries(crops).forEach(([key, crop]) => {
    const item = document.createElement("div");
    item.className = "shop-item";

    item.innerHTML = `
      <span>${crop.seedEmoji} ${crop.name}<br>
      <small>Price: ${crop.cost} coins</small></span>
      <button>Buy</button>
    `;

    item.querySelector("button").onclick = () => buySeed(key);

    container.appendChild(item);
  });
}

function buySeed(key) {
  const crop = crops[key];

  if (coins < crop.cost) {
    notify("Koin kamu belum cukup! 🪙");
    return;
  }

  coins -= crop.cost;
  seedInventory[key]++;

  notify("Berhasil membeli " + crop.name + " seeds!");
  renderAll();
}

function sellAll() {
  let total = 0;
  let amount = 0;

  Object.entries(harvestInventory).forEach(([key, count]) => {
    total += count * crops[key].sell;
    amount += count;
    harvestInventory[key] = 0;
  });

  if (amount === 0) {
    notify("Belum ada hasil panen untuk dijual!");
    return;
  }

  coins += total;

  notify(`Berhasil menjual ${amount} hasil panen! +${total} coins 🪙`);

  renderAll();
}

function renderInventory() {
  const container = document.getElementById("inventory");
  container.innerHTML = "";

  let total = 0;

  Object.entries(harvestInventory).forEach(([key, count]) => {
    if (count > 0) {
      const span = document.createElement("span");
      span.textContent = `${crops[key].emoji} ${count}`;
      container.appendChild(span);
      total += count;
    }
  });

  if (total === 0) {
    container.innerHTML = "<span>Belum ada hasil panen 🌱</span>";
  }
}

function updateStats() {
  document.getElementById("coins").textContent = coins;

  const totalSeeds = Object.values(seedInventory)
    .reduce((a, b) => a + b, 0);

  document.getElementById("seeds").textContent = totalSeeds;

  const totalHarvest = Object.values(harvestInventory)
    .reduce((a, b) => a + b, 0);

  document.getElementById("harvestCount").textContent = totalHarvest;
}

function renderAll() {
  renderGarden();
  renderSeeds();
  renderShop();
  renderInventory();
  updateStats();
}

// Plants grow automatically every second
setInterval(() => {
  let changed = false;

  garden.forEach(plant => {
    if (plant && plant.growth < 100) {
      let speed = plant.watered ? 2 : 1;
      plant.growth = Math.min(100, plant.growth + speed);
      changed = true;
    }
  });

  if (changed) renderGarden();
}, 1000);

// Start game
renderAll();
setMode("plant");

