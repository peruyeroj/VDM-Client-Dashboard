class ResidentList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        * {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }

        #content {
          padding: 20px;
          margin-top: 20px;
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
          cursor: pointer;
        }

        h1 {
          margin: 20px 0;
          text-align: center;
        }

        button {
          padding: 5px 10px;
          margin: 2px;
          cursor: pointer;
        }

        .remove-button {
          padding: 5px 10px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .remove-button:hover {
          background-color: #c82333;
        }

        .search-container {
          text-align: right;
          margin: 20px 0;
        }

        .search-container input {
          padding: 10px 20px;
          width: 250px;
          border: 1px solid #ccc;
          border-radius: 25px;
          outline: none;
          transition: box-shadow 0.3s;
        }

        .search-container input:focus {
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .search-container button {
          padding: 10px 20px;
          border: none;
          border-radius: 25px;
          background-color: #007BFF;
          color: white;
          cursor: pointer;
          margin-left: 10px;
          transition: background-color 0.3s;
        }

        .search-container button:hover {
          background-color: #0056b3;
        }

        .arrow {
          margin-left: 5px;
        }
      </style>

      <h1 style="font-size: 1.5em;">Resident List</h1>

      <div class="search-container">
        <input type="text" id="searchInput" placeholder="Search by name">
        <button id="searchButton">Search</button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th id="statusHeader">Status<span class="arrow" id="statusArrow">▲</span></th>
              <th id="nameHeader">Full Name<span class="arrow" id="nameArrow">▲</span></th>
              <th id="renterOwnerHeader">Renter/Owner<span class="arrow" id="renterOwnerArrow">▲</span></th>
              <th>Email Address</th>
              <th>Mobile Number</th>
              <th>Service Level</th>
              <th>Position in Household</th>
              <th>Start Lease Date</th>
              <th>End Lease Date</th>
              <th>Apartment Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="residentListTable">
            <!-- Rows will be appended here -->
          </tbody>
        </table>
      </div>
    `;

    this.sortOrder = {
      name: "asc",
      status: "asc",
      renterOwner: "asc",
    }; // Initialize sort order

    this.shadowRoot
      .getElementById("searchButton")
      .addEventListener("click", () => this.searchResidents());
    this.shadowRoot
      .getElementById("nameHeader")
      .addEventListener("click", () => this.sortResidents("name"));
    this.shadowRoot
      .getElementById("statusHeader")
      .addEventListener("click", () => this.sortResidents("status"));
    this.shadowRoot
      .getElementById("renterOwnerHeader")
      .addEventListener("click", () => this.sortResidents("renterOwner"));
  }

  connectedCallback() {
    this.loadResidentsFromLocalStorage();
    this.updateArrow("name"); // Initialize the arrow direction
  }

  loadResidentsFromLocalStorage() {
    const residents = JSON.parse(localStorage.getItem("residents")) || [];
    this.displayResidents(residents);
  }

  displayResidents(residents) {
    const tableBody = this.shadowRoot.getElementById("residentListTable");
    tableBody.innerHTML = ""; // Clear the table before adding rows

    residents.forEach((resident, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${resident.status}</td>
        <td>${resident.firstName} ${resident.lastName}</td>
        <td>${resident.renterOwner}</td>
        <td>${resident.email}</td>
        <td>${resident.mobileNumber}</td>
        <td>${resident.serviceLevel}</td>
        <td>${resident.position}</td>
        <td>${resident.startLeaseDate}</td>
        <td>${resident.endLeaseDate}</td>
        <td>${resident.apartmentName}</td>
        <td>
          <button class="remove-button" onclick="document.querySelector('resident-list').removeResident(${index})">Remove</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  removeResident(index) {
    const residents = JSON.parse(localStorage.getItem("residents")) || [];
    residents.splice(index, 1);
    localStorage.setItem("residents", JSON.stringify(residents));
    this.loadResidentsFromLocalStorage();
  }

  searchResidents() {
    const searchInput = this.shadowRoot
      .getElementById("searchInput")
      .value.toLowerCase();
    const residents = JSON.parse(localStorage.getItem("residents")) || [];

    if (searchInput === "") {
      this.displayResidents(residents);
    } else {
      const filteredResidents = residents.filter((resident) =>
        `${resident.firstName} ${resident.lastName}`
          .toLowerCase()
          .includes(searchInput)
      );
      this.displayResidents(filteredResidents);
    }
  }

  sortResidents(criteria) {
    const residents = JSON.parse(localStorage.getItem("residents")) || [];

    residents.sort((a, b) => {
      let valueA, valueB;
      if (criteria === "name") {
        valueA = `${a.firstName} ${a.lastName}`.toLowerCase();
        valueB = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else {
        valueA = a[criteria].toLowerCase();
        valueB = b[criteria].toLowerCase();
      }

      if (this.sortOrder[criteria] === "asc") {
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
      } else {
        if (valueA > valueB) return -1;
        if (valueA < valueB) return 1;
      }
      return 0;
    });

    // Toggle the sort order
    this.sortOrder[criteria] =
      this.sortOrder[criteria] === "asc" ? "desc" : "asc";
    this.updateArrow(criteria);

    this.displayResidents(residents);
  }

  updateArrow(criteria) {
    const arrows = {
      name: this.shadowRoot.getElementById("nameArrow"),
      status: this.shadowRoot.getElementById("statusArrow"),
      renterOwner: this.shadowRoot.getElementById("renterOwnerArrow"),
    };

    for (let key in arrows) {
      if (key === criteria) {
        arrows[key].textContent =
          this.sortOrder[criteria] === "asc" ? "▲" : "▼";
      } else {
        arrows[key].textContent = "▲"; // Reset others to default
      }
    }
  }
}

customElements.define("resident-list", ResidentList);
