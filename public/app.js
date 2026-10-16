// ===== PART 1: setup =====
// Columns of each database (must match `tables` in server.js, without id)
const columns = {
  products: ["name", "category", "price", "stock"],
  customers: ["name", "email", "phone"],
  orders: ["customer_id", "product_id", "quantity", "order_date", "status"],
};
const numberCols = ["quantity", "price", "stock"];

// Columns shown in the table (orders show names instead of ids)
const displayColumns = {
  products: ["id", "name", "category", "price", "stock"],
  customers: ["id", "name", "email", "phone"],
  orders: ["id", "customer_name", "product_name", "quantity", "order_date", "status"],
};

// Form fields that are dropdowns instead of free text
const orderStatuses = ["PAID", "PACKED", "DELIVERING", "COMPLETED", "CANCELLED"];
const dropdowns = {
  orders: {
    customer_id: { source: "customers" },
    product_id: { source: "products" },
    status: { options: orderStatuses },
  },
};

let current = "products"; // database being viewed
let editingId = null; // null = adding, otherwise = id being edited

const dbSelect = document.getElementById("dbSelect");
const table = document.getElementById("dataTable");
const toast = document.getElementById("toast");
const form = document.getElementById("dataForm");
const formFields = document.getElementById("formFields");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

let toastTimer;
function showToast(text, type = "success") {
  toast.textContent = text;
  toast.className = `show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.className = ""), 3000);
}

// ===== PART 2: build the form inputs for the current database =====
// Returns [{value, label}] for a dropdown field
async function getOptions(config) {
  if (config.options) {
    return config.options.map((o) => ({ value: o, label: o }));
  }
  const res = await fetch("/api/" + config.source);
  const rows = await res.json();
  return rows.map((r) => ({ value: r.id, label: `${r.name} (#${r.id})` }));
}

async function buildForm() {
  const dbAtStart = current;
  const fields = [];

  for (const col of columns[current]) {
    const div = document.createElement("div");
    div.className = "field";

    const label = document.createElement("label");
    label.textContent = col;

    const config = dropdowns[current]?.[col];
    let input;

    if (config) {
      input = document.createElement("select");
      for (const { value, label: text } of await getOptions(config)) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = text;
        input.appendChild(option);
      }
    } else {
      input = document.createElement("input");
      if (numberCols.includes(col)) {
        input.type = "number";
        input.step = "any";
      } else if (col === "order_date") {
        input.type = "date";
      }
    }
    input.name = col; // used later to read the value: form.elements[col]

    div.appendChild(label);
    div.appendChild(input);
    fields.push(div);
  }

  // User switched database while dropdown data was loading
  if (dbAtStart !== current) return;
  formFields.replaceChildren(...fields);
}

// ===== PART 3: load data and draw the table =====
async function loadData() {
  const res = await fetch("/api/" + current);
  const rows = await res.json();
  renderTable(rows);
}

function renderTable(rows) {
  const thead = table.tHead;
  const tbody = table.tBodies[0];
  thead.innerHTML = "";
  tbody.innerHTML = "";

  const headers = [...displayColumns[current], "actions"];
  const headRow = document.createElement("tr");
  for (const h of headers) {
    const th = document.createElement("th");
    th.textContent = h.replace("_name", "");
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);

  if (rows.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = headers.length;
    td.textContent = "No data";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  for (const row of rows) {
    const tr = document.createElement("tr");

    for (const col of displayColumns[current]) {
      const td = document.createElement("td");
      td.textContent = row[col] ?? "";
      tr.appendChild(td);
    }

    const actions = document.createElement("td");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "small";
    editBtn.addEventListener("click", () => startEdit(row));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "small danger";
    deleteBtn.addEventListener("click", () => deleteRow(row.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    tr.appendChild(actions);
    tbody.appendChild(tr);
  }
}

// ===== PART 4: switch database =====
const recordNames = { products: "Product", customers: "Customer", orders: "Order" };

async function resetForm() {
  editingId = null;
  formTitle.textContent = "Add new record";
  submitBtn.textContent = "Add";
  await buildForm();
}

dbSelect.addEventListener("change", () => {
  current = dbSelect.value;
  resetForm();
  loadData();
});

// ===== PART 5: add / update =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {};
  for (const col of columns[current]) {
    data[col] = form.elements[col].value;
  }

  const isEditing = editingId !== null;
  const url = isEditing ? `/api/${current}/${editingId}` : `/api/${current}`;

  const res = await fetch(url, {
    method: isEditing ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    showToast(await res.text(), "error");
    return;
  }

  showToast(
    `${recordNames[current]} ${isEditing ? "updated" : "added"} successfully`,
  );
  await resetForm();
  loadData();
});

// ===== PART 6: edit / delete =====
function startEdit(row) {
  editingId = row.id;
  formTitle.textContent = "Edit record";
  submitBtn.textContent = "Save";

  for (const col of columns[current]) {
    form.elements[col].value = row[col] ?? "";
  }
  form.scrollIntoView({ behavior: "smooth" });
}

async function deleteRow(id) {
  if (!confirm("Delete this record?")) return;

  const res = await fetch(`/api/${current}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    showToast(await res.text(), "error");
    return;
  }
  showToast(`${recordNames[current]} deleted successfully`);
  loadData();
}

cancelBtn.addEventListener("click", resetForm);

// ===== start =====
buildForm();
loadData();
