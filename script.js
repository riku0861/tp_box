let data = [];
let saveData = {};
let currentSave = "";

async function loadCSV() {
  const res = await fetch("box_list.csv");
  const text = await res.text();

  // 空行を除外し、3列に分割
  const lines = text.trim().split("\n").filter(l => l.trim() !== "").map(l => l.split(","));

  // データ構造を明示
  data = lines.map(([region, type, detail], i) => ({
    id: i,
    region: region.trim(),
    type: type.trim(),
    detail: detail.trim()
  }));

  loadSaveList();
}


function loadSaveList() {
  const select = document.getElementById("saveSelect");
  select.innerHTML = "";
  Object.keys(localStorage).filter(k => k.startsWith("tp_save_")).forEach(key => {
    const name = key.replace("tp_save_", "");
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
  if (select.options.length > 0) {
    select.selectedIndex = 0;
    currentSave = select.value;
    loadSave(currentSave);
  }
}

function createNewSave() {
  const name = prompt("セーブ名を入力してください");
  if (!name) return;
  const key = "tp_save_" + name;
  const init = {};
  data.forEach(d => init[d.id] = 0);
  localStorage.setItem(key, JSON.stringify(init));
  currentSave = name;
  loadSaveList();
}

function deleteSave() {
  if (!currentSave) return;
  if (confirm("本当に削除しますか？")) {
    localStorage.removeItem("tp_save_" + currentSave);
    currentSave = "";
    loadSaveList();
    document.getElementById("checklist").innerHTML = "";
    document.getElementById("progress").textContent = "取得状況: 0 / 0";
  }
}

function loadSave(name) {
  const key = "tp_save_" + name;
  saveData = JSON.parse(localStorage.getItem(key));
  renderChecklist();
}

function renderChecklist() {
  const container = document.getElementById("checklist");
  container.innerHTML = "";
  const regions = [...new Set(data.map(d => d.region))];
  let total = 0, checked = 0;

  regions.forEach(region => {
    const div = document.createElement("div");
    div.className = "region";
    div.innerHTML = `<h2>${region}</h2>`;
    data.filter(d => d.region === region).forEach(d => {
      total++;
      if (saveData[d.id]) checked++;
      const label = document.createElement("label");
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = !!saveData[d.id];
      box.onchange = () => {
        saveData[d.id] = box.checked ? 1 : 0;
        localStorage.setItem("tp_save_" + currentSave, JSON.stringify(saveData));
        renderProgress();
      };
      label.appendChild(box);
      label.append(`${d.type} - ${d.detail}`);
      div.appendChild(label);
    });
    container.appendChild(div);
  });

  renderProgress(checked, total);
}

function renderProgress(checked = 0, total = 0) {
  if (total === 0) {
    total = data.length;
    checked = Object.values(saveData).filter(v => v === 1).length;
  }
  document.getElementById("progress").textContent = `取得状況: ${checked} / ${total}`;
}

loadCSV();

