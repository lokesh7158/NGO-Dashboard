import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/dashboard.css";

interface Registration {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  additionalInfo?: string;
  createdAt: string;
}

interface Donation {
  id: string;
  userId: string;
  amount: number;
  status: string;
  transactionId?: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface DashboardStats {
  totalUsers: number;
  totalDonations: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "registrations" | "donations"
  >("overview");

  const [filterEmail, setFilterEmail] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    API.get("/admin/dashboard").then((res) => setStats(res.data));
  }, []);

  useEffect(() => {
    if (activeTab === "registrations") {
      API.get("/admin/registrations").then((res) =>
        setRegistrations(res.data.registrations),
      );
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "donations") {
      API.get("/admin/donations").then((res) =>
        setDonations(res.data.donations),
      );
    }
  }, [activeTab]);

  const filteredRegistrations = registrations.filter((reg) =>
    reg.email.toLowerCase().includes(filterEmail.toLowerCase()),
  );

  const filteredDonations = donations.filter((don) => {
    const emailMatch = don.user.email
      .toLowerCase()
      .includes(filterEmail.toLowerCase());
    const statusMatch = !filterStatus || don.status === filterStatus;
    return emailMatch && statusMatch;
  });

  const totalDonationAmount = donations.reduce(
    (sum, d) => (d.status === "SUCCESS" ? sum + d.amount : sum),
    0,
  );

  const exportRegistrationsCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Address", "Date"];
    const rows = filteredRegistrations.map((r) => [
      r.id,
      r.name,
      r.email,
      r.phone || "",
      r.address || "",
      new Date(r.createdAt).toLocaleDateString(),
    ]);

    downloadCSV("registrations.csv", headers, rows);
  };

  const exportDonationsCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Amount",
      "Status",
      "Transaction ID",
      "Date & Time",
    ];

    const rows = filteredDonations.map((d) => [
      d.id,
      d.user.name,
      d.user.email,
      d.amount,
      d.status,
      d.transactionId || "",
      new Date(d.createdAt).toLocaleString(),
    ]);

    downloadCSV("donations.csv", headers, rows);
  };

  const downloadCSV = (filename: string, headers: string[], rows: any[][]) => {
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const currentUserEmail = localStorage.getItem("userEmail") || "Admin User";
  const userInitial = currentUserEmail.charAt(0).toUpperCase();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <div className="logo-icon">📊</div>
          <div className="logo-text">NGO<span className="highlight">Hub</span></div>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="nav-icon">📈</span>
            Overview
          </div>
          <div
            className={`nav-item ${activeTab === "registrations" ? "active" : ""}`}
            onClick={() => setActiveTab("registrations")}
          >
            <span className="nav-icon">👥</span>
            Registrations
          </div>
          <div
            className={`nav-item ${activeTab === "donations" ? "active" : ""}`}
            onClick={() => setActiveTab("donations")}
          >
            <span className="nav-icon">💰</span>
            Donations
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="header-title">Executive Dashboard</h1>
            <p className="header-subtitle">Monitoring donor lifecycle and global capital distribution flow.</p>
          </div>
          <div className="user-profile">
            <div className="user-avatar">{userInitial}</div>
            <div className="user-name">Admin</div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Total Donations</div>
                <div className="metric-value">₹{stats.totalDonations.toLocaleString()}</div>
                <div className="metric-change">+5.0% This month</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Active Donors</div>
                <div className="metric-value">{Math.round(stats.totalUsers * 0.75)}</div>
                <div className="metric-change">91.8% Stable affinity</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Completion Rate</div>
                <div className="metric-value">94%</div>
                <div className="metric-change">+2.5% vs previous</div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="content-section">
              <h2 className="section-title">📊 Global Impact Overview</h2>
              <div className="chart-placeholder">
                Donation distribution and impact metrics visualization
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div className="content-section">
                <h2 className="section-title">📈 Donation Trends</h2>
                <div className="chart-placeholder" style={{ height: "250px" }}>
                  Monthly donation trends chart
                </div>
              </div>

              <div className="content-section">
                <h2 className="section-title">🎯 Registry Status</h2>
                <div className="chart-placeholder" style={{ height: "250px" }}>
                  Registration completion statistics
                </div>
              </div>
            </div>
          </>
        )}

        {/* Registrations Tab */}
        {activeTab === "registrations" && (
          <div className="content-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 className="section-title">👥 Contributor Registry</h2>
              <button className="btn btn-secondary btn-small" onClick={exportRegistrationsCSV}>
                📥 Export CSV
              </button>
            </div>

            <div className="filter-section">
              <div className="filter-group">
                <label className="filter-label">Search by Email</label>
                <input
                  type="email"
                  className="filter-input"
                  placeholder="Enter email address"
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                />
              </div>
            </div>

            {filteredRegistrations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-text">No registrations found</div>
                <div className="empty-state-subtext">Try adjusting your search criteria</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>{reg.name}</td>
                        <td>{reg.email}</td>
                        <td>{reg.phone || "—"}</td>
                        <td>{reg.address || "—"}</td>
                        <td>{new Date(reg.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === "donations" && (
          <div className="content-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 className="section-title">💰 Donation Management</h2>
                <div style={{ fontSize: "24px", fontWeight: "700", color: "#00d4ff", marginTop: "8px" }}>
                  ₹{totalDonationAmount.toLocaleString()} Total
                </div>
              </div>
              <button className="btn btn-secondary btn-small" onClick={exportDonationsCSV}>
                📥 Export CSV
              </button>
            </div>

            <div className="filter-section">
              <div className="filter-group">
                <label className="filter-label">Search by Email</label>
                <input
                  type="email"
                  className="filter-input"
                  placeholder="Enter donor email"
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Filter by Status</label>
                <select
                  className="filter-input"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>

            {filteredDonations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-text">No donations found</div>
                <div className="empty-state-subtext">Try adjusting your filters</div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Donor Name</th>
                      <th>Email</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Transaction ID</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((donation) => (
                      <tr key={donation.id}>
                        <td>{donation.user.name}</td>
                        <td>{donation.user.email}</td>
                        <td style={{ fontWeight: "600", color: "#00d4ff" }}>₹{donation.amount}</td>
                        <td>
                          <span className={`status-badge ${donation.status.toLowerCase()}`}>
                            {donation.status}
                          </span>
                        </td>
                        <td>{donation.transactionId || "—"}</td>
                        <td>{new Date(donation.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
