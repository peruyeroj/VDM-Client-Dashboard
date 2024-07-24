class ResidentInsert extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .table-container {
          width: 100%;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          border: 1px solid #ddd;
          padding: 8px;
          white-space: nowrap;
        }
        th {
          background-color: #f2f2f2;
        }
        .button {
          margin-top: 20px;
        }
        .file-input {
          margin: 20px 0;
        }
        .status-select {
          position: relative;
        }
        .status-circle {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-right: 5px;
          vertical-align: middle;
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
        }
        .active-option {
          color: darkgreen;
        }
        .inactive-option {
          color: darkred;
        }
      </style>

      <h1>Upload/Update Residents</h1>
      <h2>View 34
          401 E 34th St, New York, NY 10016
      </h2>
      <form id="onboardingForm" enctype="multipart/form-data">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Renter/Owner</th>
                <th>Email Address</th>
                <th>Mobile Number</th>
                <th>Service Level</th>
                <th>Position in Household</th>
                <th>Start Lease Date</th>
                <th>End Lease Date</th>
                <th>Apartment Unit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody id="residentsTable"></tbody>
          </table>
        </div>

        <div class="file-input">
          <label for="csvFileInput">Upload CSV to populate rows:</label>
          <input type="file" id="csvFileInput" accept=".csv" />
        </div>

        <button type="button" id="addRowBtn">Add Another Resident</button>
        <button type="submit" class="button">Submit</button>
      </form>

      <h2>Archived Residents</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Renter/Owner</th>
              <th>Email Address</th>
              <th>Mobile Number</th>
              <th>Service Level</th>
              <th>Position in Household</th>
              <th>Start Lease Date</th>
              <th>End Lease Date</th>
              <th>Apartment Unit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody id="archivedResidentsTable">
            <!-- Archived rows will be appended here -->
          </tbody>
        </table>
      </div>
    `;

    this.fieldsMap = [
      {
        datafield: "fullname",
        isoptional: false,
        substrings: ["full"],
        fallbackfields: ["firstname", "lastname"],
      },
      { datafield: "firstname", isoptional: true, substrings: ["first"] },
      { datafield: "lastname", isoptional: true, substrings: ["last"] },
      {
        datafield: "aptname",
        isoptional: false,
        substrings: ["apt", "unit", "apartment"],
      },
    ];

    this.apartmentNames = [
      "1C - Studio Apartment",
      "1A - One-Bedroom Apartment",
      "1b - Two-Bedroom Apartment",
      "1C - Studio Apartment",
      "1D - Two-Bedroom Apartment",
      "1E - Three-Bedroom Apartment",
    ];
  }

  connectedCallback() {
    this.shadowRoot
      .querySelector("#csvFileInput")
      .addEventListener("change", this.handleFileUpload.bind(this));
    this.shadowRoot
      .querySelector("#onboardingForm")
      .addEventListener("submit", this.handleSubmit.bind(this));
    this.shadowRoot
      .querySelector("#addRowBtn")
      .addEventListener("click", this.addRow.bind(this));
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").map((row) => row.split(","));
      const headers = rows[0].map((header) => header.trim().toLowerCase());
      const dataRows = rows.slice(1);

      const table = this.shadowRoot.querySelector("#residentsTable");
      while (table.rows.length > 0) {
        table.deleteRow(0);
      }

      dataRows.forEach((row) => {
        if (row.length > 1) {
          this.addRow();
          const newRow = table.rows[table.rows.length - 1];
          const fieldValues = {};

          headers.forEach((header, colIndex) => {
            fieldValues[header] = row[colIndex].trim();
          });

          this.populateFields(newRow, fieldValues);
          this.setStatusOptionColor(
            newRow.cells[0].getElementsByTagName("select")[0]
          );
        }
      });
    };

    reader.readAsText(file);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.saveResidents();
    alert("Residents saved successfully!");
  }

  saveResidents() {
    const table = this.shadowRoot.querySelector("#residentsTable");
    const residents = [];

    for (let i = 0; i < table.rows.length; i++) {
      const row = table.rows[i];
      const resident = {
        status: row.cells[0].getElementsByTagName("select")[0].value,
        firstName: row.cells[1].getElementsByTagName("input")[0].value,
        lastName: row.cells[2].getElementsByTagName("input")[0].value,
        renterOwner: row.cells[3].getElementsByTagName("select")[0].value,
        email: row.cells[4].getElementsByTagName("input")[0].value,
        mobileNumber: row.cells[5].getElementsByTagName("input")[0].value,
        serviceLevel: row.cells[6].getElementsByTagName("select")[0].value,
        position: row.cells[7].getElementsByTagName("select")[0].value,
        startLeaseDate: row.cells[8].getElementsByTagName("input")[0].value,
        endLeaseDate: row.cells[9].getElementsByTagName("input")[0].value,
        apartmentName: row.cells[10].getElementsByTagName("select")[0].value,
      };
      residents.push(resident);
    }

    localStorage.setItem("residents", JSON.stringify(residents));
  }

  populateFields(row, values) {
    const fullname = values["fullname"];
    let firstname = values["first name"];
    let lastname = values["last name"];

    if (fullname && (!firstname || !lastname)) {
      const nameParts = fullname.split(" ");
      firstname = nameParts[0];
      lastname = nameParts.slice(1).join(" ");
    }

    row.cells[0].getElementsByTagName("select")[0].value =
      values["status"] || "Active";
    row.cells[1].getElementsByTagName("input")[0].value = firstname || "";
    row.cells[2].getElementsByTagName("input")[0].value = lastname || "";
    row.cells[3].getElementsByTagName("select")[0].value =
      values["renter/owner"] || "";
    row.cells[4].getElementsByTagName("input")[0].value =
      values["email address"] || "";
    row.cells[5].getElementsByTagName("input")[0].value =
      values["mobile number"] || "";
    row.cells[6].getElementsByTagName("select")[0].value =
      values["service level"] || "";
    row.cells[7].getElementsByTagName("select")[0].value =
      values["position in household"] || "";
    row.cells[8].getElementsByTagName("input")[0].value = this.formatDate(
      values["start lease date"] || ""
    );
    row.cells[9].getElementsByTagName("input")[0].value = this.formatDate(
      values["end lease date"] || ""
    );
    row.cells[10].getElementsByTagName("select")[0].value =
      values["apartment name"] || "";
  }

  formatDate(dateString) {
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const day = parts[1].padStart(2, "0");
      const month = parts[0].padStart(2, "0");
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return "";
  }

  addRow() {
    const table = this.shadowRoot.querySelector("#residentsTable");
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
              <td>
                  <div class="status-select">
                      <select name="status[]" onchange="this.getRootNode().host.setStatusOptionColor(this)" required>
                          <option value="Active" class="active-option">Active</option>
                          <option value="Inactive" class="inactive-option">Inactive</option>
                      </select>
                      <span class="status-circle"></span>
                  </div>
              </td>
              <td><input type="text" name="firstName[]" required /></td>
              <td><input type="text" name="lastName[]" required /></td>
              <td>
                  <select name="renterOwner[]" required>
                      <option value="Renter">Renter</option>
                      <option value="Owner">Owner</option>
                  </select>
              </td>
              <td><input type="email" name="email[]" required /></td>
              <td><input type="tel" name="mobileNumber[]" required /></td>
              <td>
                  <select name="serviceLevel[]" required>
                      <option value="Bronze">Bronze</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                  </select>
              </td>
              <td>
                  <select name="position[]" required>
                      <option value="Head of Household">Head of Household</option>
                      <option value="Member of Household">Member of Household</option>
                  </select>
              </td>
              <td><input type="date" name="startLeaseDate[]"></td>
              <td><input type="date" name="endLeaseDate[]"/></td>
              <td>
                  <select name="apartmentName[]" required>
                      ${this.apartmentNames
                        .map(
                          (name) => `<option value="${name}">${name}</option>`
                        )
                        .join("")}
                  </select>
              </td>
              <td>
                  <button type="button" onclick="this.getRootNode().host.removeRow(this)">Remove</button>
              </td>
          `;
    table.appendChild(newRow);
    this.updateRowIndices();
  }

  removeRow(button) {
    const row = button.closest("tr");
    const archiveTable = this.shadowRoot.querySelector(
      "#archivedResidentsTable"
    );

    const clonedRow = row.cloneNode(true);
    clonedRow.querySelector("td:last-child").innerHTML =
      '<button type="button" onclick="this.getRootNode().host.removeArchivedRow(this)">Remove</button>';

    archiveTable.appendChild(clonedRow);
    row.parentNode.removeChild(row);
    this.updateRowIndices();
  }

  removeArchivedRow(button) {
    const row = button.closest("tr");
    row.parentNode.removeChild(row);
  }

  updateRowIndices() {
    const table = this.shadowRoot.querySelector("#residentsTable");
    const rows = table.getElementsByTagName("tr");
    for (let i = 0; i < rows.length; i++) {
      const inputs = rows[i].getElementsByTagName("input");
      const selects = rows[i].getElementsByTagName("select");

      for (let j = 0; j < inputs.length; j++) {
        inputs[j].name = inputs[j].name.replace(/\[\d+\]$/, `[${i}]`);
      }
      for (let k = 0; k < selects.length; k++) {
        selects[k].name = selects[k].name.replace(/\[\d+\]$/, `[${i}]`);
      }
    }
  }

  setStatusOptionColor(select) {
    const statusSelect = select;
    const selectedValue = statusSelect.value;
    const statusCircle =
      statusSelect.parentNode.querySelector(".status-circle");

    if (selectedValue === "Active") {
      statusSelect.classList.remove("inactive-option");
      statusSelect.classList.add("active-option");
      statusCircle.style.backgroundColor = "darkgreen";
      statusCircle.style.display = "inline-block";
    } else if (selectedValue === "Inactive") {
      statusSelect.classList.remove("active-option");
      statusSelect.classList.add("inactive-option");
      statusCircle.style.backgroundColor = "darkred";
      statusCircle.style.display = "inline-block";
    } else {
      statusSelect.classList.remove("active-option", "inactive-option");
      statusCircle.style.display = "none";
    }
  }
}

customElements.define("resident-insert", ResidentInsert);
