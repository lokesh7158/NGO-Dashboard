import { useEffect, useState } from "react";
import API from "../api/api";

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

  return (
    <div
      style={{
        padding: "30px 20px",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0e27, #1a1f3a)",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "36px",
            marginBottom: "30px",
            background: "linear-gradient(135deg, #00d4ff, #00f0ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Admin Dashboard
        </h1>

        <div style={{ display: "flex", gap: 10, marginBottom: 30 }}>
          {(["overview", "registrations", "donations"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 24px",
                fontWeight: 600,
                borderRadius: 6,
                cursor: "pointer",
                border: "1px solid #2d3561",
                background:
                  activeTab === tab
                    ? "linear-gradient(135deg, #00d4ff, #00a8d8)"
                    : "transparent",
                color: activeTab === tab ? "#0a0e27" : "#7a8ab3",
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {activeTab === "overview" && stats && (
          <div style={{ display: "flex", gap: 20 }}>
            <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
            <StatCard
              label="Total Donations"
              value={`₹${stats.totalDonations}`}
              icon="💰"
            />
          </div>
        )}

        {activeTab === "registrations" && (
          <>
            <div style={{ marginBottom: 15 }}>
              <input
                placeholder="Filter by email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                style={{ padding: 12, width: 280 }}
              />
              <button
                onClick={exportRegistrationsCSV}
                style={{ marginLeft: 10 }}
              >
                Export CSV
              </button>
            </div>

            <SimpleTable
              headers={["Name", "Email", "Phone", "Address", "Date"]}
              rows={filteredRegistrations.map((r) => [
                r.name,
                r.email,
                r.phone || "—",
                r.address || "—",
                new Date(r.createdAt).toLocaleDateString(),
              ])}
            />
          </>
        )}

        {activeTab === "donations" && (
          <>
            <div style={{ marginBottom: 15 }}>
              <input
                placeholder="Filter by email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                style={{ padding: 12, marginRight: 10 }}
              />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: 12 }}
              >
                <option value="">All Status</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>

              <button onClick={exportDonationsCSV} style={{ marginLeft: 10 }}>
                Export CSV
              </button>
            </div>

            <h2>₹{totalDonationAmount}</h2>

            <SimpleTable
              headers={[
                "Name",
                "Email",
                "Amount",
                "Status",
                "Transaction ID",
                "Date & Time",
              ]}
              rows={filteredDonations.map((d) => [
                d.user.name,
                d.user.email,
                `₹${d.amount}`,
                d.status,
                d.transactionId || "—",
                new Date(d.createdAt).toLocaleString(),
              ])}
            />
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: any;
  icon: string;
}) => (
  <div
    style={{
      padding: 25,
      borderRadius: 12,
      background: "#141928",
      border: "1px solid #2d3561",
      minWidth: 280,
    }}
  >
    <div style={{ fontSize: 28 }}>{icon}</div>
    <p style={{ color: "#7a8ab3" }}>{label}</p>
    <h2 style={{ color: "#00d4ff" }}>{value}</h2>
  </div>
);

const SimpleTable = ({
  headers,
  rows,
}: {
  headers: string[];
  rows: any[][];
}) => (
  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 15 }}>
    <thead>
      <tr>
        {headers.map((h) => (
          <th
            key={h}
            style={{
              textAlign: "left",
              padding: 10,
              borderBottom: "1px solid #2d3561",
            }}
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {row.map((cell, j) => (
            <td
              key={j}
              style={{
                padding: 10,
                borderBottom: "1px solid #1f2a45",
              }}
            >
              {cell}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default AdminDashboard;
