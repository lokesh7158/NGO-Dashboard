import { useEffect, useState } from "react";
import API from "../api/api";

interface Registration {
  id: string;
  userId: string;
  phone: string;
  address: string;
  additionalInfo?: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
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

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "donations">("overview");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch dashboard stats
  useEffect(() => {
    API.get("/admin/dashboard").then((res) => setStats(res.data));
  }, []);

  // Fetch registrations
  useEffect(() => {
    if (activeTab === "registrations") {
      API.get("/admin/registrations").then((res) =>
        setRegistrations(res.data.registrations)
      );
    }
  }, [activeTab]);

  // Fetch donations
  useEffect(() => {
    if (activeTab === "donations") {
      API.get("/admin/donations").then((res) =>
        setDonations(res.data.donations)
      );
    }
  }, [activeTab]);

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) =>
    reg.user.email.toLowerCase().includes(filterEmail.toLowerCase())
  );

  // Filter donations
  const filteredDonations = donations.filter((don) => {
    const emailMatch = don.user.email
      .toLowerCase()
      .includes(filterEmail.toLowerCase());
    const statusMatch = !filterStatus || don.status === filterStatus;
    return emailMatch && statusMatch;
  });

  // Calculate aggregated donation amount
  const totalDonationAmount = donations.reduce((sum, don) => {
    if (don.status === "SUCCESS") return sum + don.amount;
    return sum;
  }, 0);

  // Export registrations as CSV
  const exportRegistrationsCSV = () => {
    const headers = ["ID", "Name", "Email", "Phone", "Address", "Date"];
    const rows = filteredRegistrations.map((reg) => [
      reg.id,
      reg.user.name,
      reg.user.email,
      reg.phone,
      reg.address,
      new Date(reg.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
  };

  return (
    <div
      style={{
        padding: "30px 20px",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "36px",
            marginBottom: "30px",
            background: "linear-gradient(135deg, #00d4ff 0%, #00f0ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Admin Dashboard
        </h1>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "30px",
            borderBottom: "2px solid #2d3561",
            paddingBottom: "15px",
          }}
        >
          {(["overview", "registrations", "donations"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 24px",
                fontSize: "15px",
                fontWeight: "600",
                textTransform: "capitalize",
                background:
                  activeTab === tab
                    ? "linear-gradient(135deg, #00d4ff 0%, #00a8d8 100%)"
                    : "transparent",
                color: activeTab === tab ? "#0a0e27" : "#7a8ab3",
                border: activeTab === tab ? "none" : "1px solid #2d3561",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <h2 style={{ fontSize: "24px", marginBottom: "25px", color: "#ffffff" }}>
              Dashboard Overview
            </h2>
            {stats && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {[
                  { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "#00d4ff" },
                  {
                    label: "Total Registrations",
                    value: stats.totalRegistrations,
                    icon: "📋",
                    color: "#00ff88",
                  },
                  {
                    label: "Total Donations",
                    value: `₹${stats.totalDonations}`,
                    icon: "💰",
                    color: "#ffa500",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "25px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #141928 0%, #1a2244 100%)",
                      border: "1px solid #2d3561",
                      boxShadow: `0 0 20px ${stat.color}20`,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-5px)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 10px 30px ${stat.color}40`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${stat.color}20`;
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "10px" }}>{stat.icon}</div>
                    <p
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "13px",
                        color: "#7a8ab3",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {stat.label}
                    </p>
                    <h3
                      style={{
                        margin: "0",
                        fontSize: "32px",
                        color: stat.color,
                        fontWeight: "700",
                      }}
                    >
                      {stat.value}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Registrations Tab */}
        {activeTab === "registrations" && (
          <div>
            <h2 style={{ fontSize: "24px", marginBottom: "25px", color: "#ffffff" }}>
              Registration Management
            </h2>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "25px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="Filter by email..."
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: "250px",
                  padding: "12px 16px",
                  fontSize: "14px",
                }}
              />
              <button
                onClick={exportRegistrationsCSV}
                style={{
                  padding: "12px 24px",
                  fontSize: "15px",
                  fontWeight: "600",
                  background: "linear-gradient(135deg, #00ff88 0%, #00cc66 100%)",
                  color: "#0a0e27",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                📥 Export CSV
              </button>
            </div>
            <div
              style={{
                overflowX: "auto",
                borderRadius: "12px",
                border: "1px solid #2d3561",
                backgroundColor: "#141928",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#1a2244" }}>
                    {["Name", "Email", "Phone", "Address", "Date"].map((header) => (
                      <th
                        key={header}
                        style={{
                          padding: "15px 16px",
                          textAlign: "left",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "#00d4ff",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          borderBottom: "2px solid #2d3561",
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.length > 0 ? (
                    filteredRegistrations.map((reg, idx) => (
                      <tr
                        key={reg.id}
                        style={{
                          backgroundColor: idx % 2 === 0 ? "#0f131f" : "#141928",
                          borderBottom: "1px solid #2d3561",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                            "#1f2a45";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                            idx % 2 === 0 ? "#0f131f" : "#141928";
                        }}
                      >
                        <td style={{ padding: "15px 16px", color: "#ffffff" }}>
                          {reg.user.name}
                        </td>
                        <td style={{ padding: "15px 16px", color: "#7a8ab3" }}>
                          {reg.user.email}
                        </td>
                        <td style={{ padding: "15px 16px", color: "#ffffff" }}>
                          {reg.phone}
                        </td>
                        <td style={{ padding: "15px 16px", color: "#ffffff" }}>
                          {reg.address}
                        </td>
                        <td style={{ padding: "15px 16px", color: "#7a8ab3" }}>
                          {new Date(reg.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: "30px",
                          textAlign: "center",
                          color: "#7a8ab3",
                          fontSize: "14px",
                        }}
                      >
                        No registrations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === "donations" && (
          <div>
            <h2 style={{ fontSize: "24px", marginBottom: "25px", color: "#ffffff" }}>
              Donation Management
            </h2>
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "25px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="Filter by email..."
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: "250px",
                  padding: "12px 16px",
                  fontSize: "14px",
                }}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  minWidth: "180px",
                }}
              >
                <option value="">All Status</option>
                <option value="SUCCESS">✓ SUCCESS</option>
                <option value="PENDING">⏳ PENDING</option>
                <option value="FAILED">✗ FAILED</option>
              </select>
            </div>

            <div
              style={{
                padding: "25px",
                marginBottom: "25px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0d4d1a 0%, #1a6b2f 100%)",
                border: "1px solid #2d5a3a",
                boxShadow: "0 0 20px #00ff8820",
              }}
            >
              <p
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "13px",
                  color: "#7ae8a8",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                💰 Total Donation Amount (Successful)
              </p>
              <h3
                style={{
                  margin: "0",
                  fontSize: "36px",
                  color: "#00ff88",
                  fontWeight: "700",
                }}
              >
                ₹{totalDonationAmount.toLocaleString()}
              </h3>
            </div>

            <div
              style={{
                overflowX: "auto",
                borderRadius: "12px",
                border: "1px solid #2d3561",
                backgroundColor: "#141928",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1a2244" }}>
                    {["Name", "Email", "Amount", "Status", "Transaction ID", "Date & Time"].map(
                      (header) => (
                        <th
                          key={header}
                          style={{
                            padding: "15px 16px",
                            textAlign: "left",
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "#00d4ff",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            borderBottom: "2px solid #2d3561",
                          }}
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.length > 0 ? (
                    filteredDonations.map((don, idx) => (
                      <tr
                        key={don.id}
                        style={{
                          backgroundColor: idx % 2 === 0 ? "#0f131f" : "#141928",
                          borderBottom: "1px solid #2d3561",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                            "#1f2a45";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                            idx % 2 === 0 ? "#0f131f" : "#141928";
                        }}
                      >
                        <td style={{ padding: "15px 16px", color: "#ffffff" }}>
                          {don.user.name}
                        </td>
                        <td style={{ padding: "15px 16px", color: "#7a8ab3" }}>
                          {don.user.email}
                        </td>
                        <td style={{ padding: "15px 16px", color: "#00ff88", fontWeight: "600" }}>
                          ₹{don.amount}
                        </td>
                        <td
                          style={{
                            padding: "15px 16px",
                            fontWeight: "600",
                            borderRadius: "6px",
                            color:
                              don.status === "SUCCESS"
                                ? "#00ff88"
                                : don.status === "FAILED"
                                  ? "#ff6b6b"
                                  : "#ffa500",
                          }}
                        >
                          {don.status === "SUCCESS"
                            ? "✓ SUCCESS"
                            : don.status === "FAILED"
                              ? "✗ FAILED"
                              : "⏳ PENDING"}
                        </td>
                        <td style={{ padding: "15px 16px", color: "#7a8ab3", fontFamily: "monospace" }}>
                          {don.transactionId || "—"}
                        </td>
                        <td style={{ padding: "15px 16px", color: "#7a8ab3", fontSize: "13px" }}>
                          {new Date(don.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: "30px",
                          textAlign: "center",
                          color: "#7a8ab3",
                          fontSize: "14px",
                        }}
                      >
                        No donations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
