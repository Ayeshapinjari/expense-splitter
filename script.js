/* =========================
FILE: script.js
========================= */

const state = {
  groups: [],
  expenses: [],
  members: [],
  theme: "dark"
};

/* =========================
INIT
========================= */

window.onload = () => {
  setTimeout(() => {
    document.getElementById("loader").style.display = "none";
  }, 1500);

  loadTheme();
  render();
};

/* =========================
THEME
========================= */

const themeToggle = document.getElementById("themeToggle");

themeToggle.onclick = () => {
  document.body.classList.toggle("light");

  state.theme =
    document.body.classList.contains("light")
      ? "light"
      : "dark";

  localStorage.setItem("theme", state.theme);
};

function loadTheme() {
  const saved = localStorage.getItem("theme");

  if (saved === "light") {
    document.body.classList.add("light");
  }
}

/* =========================
MENU
========================= */

document.getElementById("menuBtn").onclick = () => {
  document.getElementById("navLinks").classList.toggle("active");
};

/* =========================
TOAST
========================= */

function toast(message) {
  const toast = document.getElementById("toast");

  toast.innerText = message;
  toast.style.opacity = 1;

  setTimeout(() => {
    toast.style.opacity = 0;
  }, 2500);
}

/* =========================
MODAL
========================= */

function openModal(content) {
  document.getElementById("modalContent").innerHTML = content;
  document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

document.getElementById("modalOverlay").onclick = (e) => {
  if (e.target.id === "modalOverlay") {
    closeModal();
  }
};

/* =========================
CREATE GROUP
========================= */

function showCreateGroupModal() {
  openModal(`
    <h2>Create Group</h2>

    <input id="groupName" placeholder="Group Name"/>
    <textarea id="groupDesc" placeholder="Description"></textarea>

    <button class="primary-btn" onclick="createGroup()">
      Create
    </button>
  `);
}

document.getElementById("newGroupBtn").onclick =
  showCreateGroupModal;

document.getElementById("createGroupHero").onclick =
  showCreateGroupModal;

document.getElementById("emptyCreateBtn").onclick =
  showCreateGroupModal;

function createGroup() {

  const name =
    document.getElementById("groupName").value;

  const desc =
    document.getElementById("groupDesc").value;

  if (!name) {
    toast("Enter group name");
    return;
  }

  const group = {
    id: Date.now(),
    name,
    desc,
    members: [],
    expenses: []
  };

  state.groups.push(group);

  closeModal();
  render();

  toast("Group created");
}

/* =========================
RENDER GROUPS
========================= */

function render() {

  const groupsContainer =
    document.getElementById("groupsContainer");

  const historyList =
    document.getElementById("historyList");

  if (state.groups.length === 0) {

    groupsContainer.innerHTML = `
      <div class="empty-state glass">
        <h2>No Groups Yet</h2>
        <p>Create your first group.</p>

        <button class="primary-btn"
        onclick="showCreateGroupModal()">
          Create Group
        </button>
      </div>
    `;

  } else {

    groupsContainer.innerHTML = "";

    state.groups.forEach(group => {

      const total =
        group.expenses.reduce(
          (a,b)=>a+b.amount,0
        );

      const card = document.createElement("div");

      card.className = "group-card glass";

      card.innerHTML = `
        <h3>${group.name}</h3>

        <p>${group.desc || "No description"}</p>

        <br>

        <p>Members: ${group.members.length}</p>

        <p>Total: ₹${total}</p>

        <div class="group-actions">

          <button class="secondary-btn"
          onclick="showAddMemberModal(${group.id})">
            Add Member
          </button>

          <button class="primary-btn"
          onclick="showAddExpenseModal(${group.id})">
            Add Expense
          </button>

        </div>

      `;

      groupsContainer.appendChild(card);
    });
  }
/* =========================
GROUP SEARCH
========================= */

document
  .getElementById("groupSearch")
  .addEventListener("input", function () {

    const value =
      this.value.toLowerCase();

    const cards =
      document.querySelectorAll(".group-card");

    cards.forEach(card => {

      const title =
        card.querySelector("h3")
        .innerText
        .toLowerCase();

      const desc =
        card.querySelector("p")
        .innerText
        .toLowerCase();

      if (
        title.includes(value) ||
        desc.includes(value)
      ) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });

/* =========================
HISTORY SEARCH
========================= */

document
  .getElementById("historySearch")
  .addEventListener("input", function () {

    const value =
      this.value.toLowerCase();

    const items =
      document.querySelectorAll(".history-item");

    items.forEach(item => {

      const text =
        item.innerText.toLowerCase();

      if (text.includes(value)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
  });
  /* COUNTERS */

  const totalExpenses =
    state.groups.reduce((sum,g)=>
      sum + g.expenses.reduce(
        (a,b)=>a+b.amount,0
      ),0);

  const totalMembers =
    state.groups.reduce(
      (a,b)=>a+b.members.length,0
    );

  document.getElementById("totalGroups")
    .innerText = state.groups.length;

  document.getElementById("totalMembers")
    .innerText = totalMembers;

  document.getElementById("totalExpenses")
    .innerText = `₹${totalExpenses}`;

  document.getElementById("dashboardTotal")
    .innerText = `₹${totalExpenses}`;

  /* HISTORY */

  historyList.innerHTML = "";

  state.groups.forEach(group => {

    group.expenses.forEach(exp => {

      const item =
        document.createElement("div");

      item.className =
        "history-item glass";

      item.innerHTML = `
        <h3>${exp.title}</h3>

        <p>₹${exp.amount}</p>

        <p>Paid by ${exp.paidBy}</p>

        <small>${group.name}</small>
      `;

      historyList.appendChild(item);
    });
  });

  renderAnalytics();
}

/* =========================
ADD MEMBER
========================= */

function showAddMemberModal(groupId){

  openModal(`
    <h2>Add Member</h2>

    <input id="memberName"
    placeholder="Member Name"/>

    <button class="primary-btn"
    onclick="addMember(${groupId})">
      Add
    </button>
  `);
}

function addMember(groupId){

  const name =
    document.getElementById("memberName").value;

  if(!name){
    toast("Enter member name");
    return;
  }

  const group =
    state.groups.find(g=>g.id===groupId);

  group.members.push({
    id:Date.now(),
    name
  });

  closeModal();

  render();

  toast("Member added");
}

/* =========================
ADD EXPENSE
========================= */

function showAddExpenseModal(groupId){

  const group =
    state.groups.find(g=>g.id===groupId);

  if(group.members.length===0){
    toast("Add members first");
    return;
  }

  openModal(`
    <h2>Add Expense</h2>

    <input id="expenseTitle"
    placeholder="Expense Title"/>

    <input id="expenseAmount"
    type="number"
    placeholder="Amount"/>

    <select id="expensePaidBy">
      ${group.members.map(m=>
        `<option>${m.name}</option>`
      ).join("")}
    </select>

    <button class="primary-btn"
    onclick="addExpense(${groupId})">
      Save Expense
    </button>
  `);
}

function addExpense(groupId){

  const title =
    document.getElementById("expenseTitle").value;

  const amount =
    +document.getElementById("expenseAmount").value;

  const paidBy =
    document.getElementById("expensePaidBy").value;

  if(!title || !amount){
    toast("Fill all fields");
    return;
  }

  const group =
    state.groups.find(g=>g.id===groupId);

  group.expenses.push({
    id:Date.now(),
    title,
    amount,
    paidBy
  });

  closeModal();

  render();

  toast("Expense added");
}

/* =========================
ANALYTICS
========================= */

function renderAnalytics(){

  const contributors =
    document.getElementById("contributors");

  contributors.innerHTML = "";

  const totals = {};

  state.groups.forEach(group => {

    group.expenses.forEach(exp => {

      totals[exp.paidBy] =
        (totals[exp.paidBy] || 0)
        + exp.amount;
    });
  });

  Object.keys(totals).forEach(name => {

    contributors.innerHTML += `
      <div style="
      margin-top:15px">

        <p>${name}</p>

        <div style="
        height:10px;
        background:#222;
        border-radius:20px;
        overflow:hidden">

          <div style="
          width:${Math.min(
            totals[name]/100,
            100
          )}%;
          height:100%;
          background:
          linear-gradient(
            90deg,
            #7c4dff,
            #00d4ff
          );
          "></div>

        </div>

      </div>
    `;
  });

  /* SIMPLE SETTLEMENT */

  const settlements =
    document.getElementById("settlements");

  settlements.innerHTML = "";

  state.groups.forEach(group => {

    const total =
      group.expenses.reduce(
        (a,b)=>a+b.amount,0
      );

    const split =
      total /
      (group.members.length || 1);

    group.members.forEach(member => {

      let paid = 0;

      group.expenses.forEach(exp => {
        if(exp.paidBy===member.name){
          paid += exp.amount;
        }
      });

      const balance =
        paid - split;

      settlements.innerHTML += `
        <div style="
        margin-top:15px;
        padding:15px;
        border-radius:14px;
        background:
        rgba(255,255,255,0.05)">

          <h4>${member.name}</h4>

          <p style="
          color:${
            balance>=0
            ? '#00ffae'
            : '#ff4d6d'
          }">

            ${
              balance>=0
              ? 'Gets Back'
              : 'Owes'
            }

            ₹${Math.abs(balance).toFixed(0)}

          </p>

        </div>
      `;
    });
  });

  renderChart();
}

/* =========================
CANVAS CHART
========================= */

function renderChart(){

  const canvas =
    document.getElementById("expenseChart");

  const ctx =
    canvas.getContext("2d");

  canvas.width = 300;
  canvas.height = 200;

  ctx.clearRect(0,0,300,200);

  const values = [];

  state.groups.forEach(group => {

    values.push(
      group.expenses.reduce(
        (a,b)=>a+b.amount,0
      )
    );
  });

  const max =
    Math.max(...values,100);

  values.forEach((v,i)=>{

    const height =
      (v/max) * 150;

    ctx.fillStyle =
      "#7c4dff";

    ctx.fillRect(
      i*70 + 30,
      180-height,
      40,
      height
    );
  });
}

/* =========================
FAB
========================= */

document.getElementById("addExpenseFab")
.onclick = () => {

  if(state.groups.length===0){
    toast("Create group first");
    return;
  }

  showAddExpenseModal(state.groups[0].id);
};

/* =========================
EXPORT
========================= */

document.getElementById("exportBtn")
.onclick = exportData;

function exportData(){

  const data =
    JSON.stringify(state,null,2);

  const blob =
    new Blob([data],{
      type:"application/json"
    });

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "novasplit-backup.json";

  a.click();

  toast("Exported successfully");
}

/* =========================
IMPORT
========================= */

document.getElementById("importBtn")
.onclick = () => {
  document.getElementById(
    "importInput"
  ).click();
};

document.getElementById("importInput")
.onchange = (e) => {

  const file = e.target.files[0];

  const reader = new FileReader();

  reader.onload = () => {

    const data =
      JSON.parse(reader.result);

    state.groups =
      data.groups || [];

    render();

    toast("Imported successfully");
  };

  reader.readAsText(file);
};

/* =========================
RESET
========================= */

document.getElementById("resetBtn")
.onclick = () => {

  if(confirm(
    "Delete all app data?"
  )){

    state.groups = [];

    render();

    toast("App reset");
  }
};