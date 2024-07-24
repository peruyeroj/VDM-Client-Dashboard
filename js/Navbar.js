class Navbar extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `
        <style>
          /* Navbar styles */
          .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #f8f9fa; /* Light gray background */
            padding: 10px 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Optional: Adds a subtle shadow */
          }
  
          .navbar .logo img {
            max-height: 40px; /* Adjust logo size as needed */
          }
  
          .nav-links ul {
            list-style-type: none;
            margin: 0;
            padding: 0;
            display: flex;
          }
  
          .nav-links ul li {
            margin-left: 10px; /* Adjust spacing between links */
          }
  
          .nav-links ul li a {
            color: #343a40; /* Dark color for links */
            text-decoration: none;
            padding: 10px 15px;
            display: inline-block;
            transition: all 0.3s ease; /* Smooth transition */
          }
  
          .nav-links ul li a:hover {
            background-color: #e9ecef; /* Lighter background on hover */
            color: #343a40; /* Dark color on hover */
          }
        </style>
        <header>
          <div class="navbar">
            <div class="logo">
              <a href='/html/index.html'><img src="/assets/images/logo.png" alt="Logo" /></a>
            </div>
            <nav class="nav-links">
              <ul>
                <li><a href="/html/index.html">Dashboard</a></li>
                <li><a href="/html/Resident.html">Manage Residents</a></li>
                <li><a href="/html/display_residents.html">Resident List</a></li>
                <li><a href="/html/service_repair.html">Install/Service</a></li>
              </ul>
            </nav>
          </div>
        </header>
      `;
  }
}

customElements.define("nav-bar", Navbar);
