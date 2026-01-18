import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/dashboard.css";

interface Registration {
  id: string;
  userId: string;
  phone: string;
  address: string;
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
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationAmount, setDonationAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "donations">(
    "overview",
  );
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    phone: "",
    address: "",
    additionalInfo: "",
  });

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const res = await API.get("/registration/me");
        setRegistration(res.data.registration);
      } catch (err: any) {
        console.log("No registration found");
      }
    };
    fetchRegistration();
  }, []);

  useEffect(() => {
    if (activeTab === "donations") {
      const fetchDonations = async () => {
        try {
          const res = await API.get("/donation/me");
          setDonations(res.data.donations);
        } catch (err: any) {
          console.error("Error fetching donations:", err);
        }
      };
      fetchDonations();
    }
  }, [activeTab]);

  const handleRegister = async () => {
    if (!registrationData.phone || !registrationData.address) {
      alert("Please fill in all required fields");
      return;
    }
    setRegistrationLoading(true);
    try {
      const res = await API.post("/registration", registrationData);
      setRegistration(res.data.registration);
      alert("Registration successful!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert("Please enter a valid donation amount");
      return;
    }
    setLoading(true);
    try {
      const res = await API.post("/donation/initiate", {
        amount: parseFloat(donationAmount),
      });

      const { paymentRequest, checksum, payhereUrl } = res.data;

      // Create a form and submit it to PayHere
      const form = document.createElement("form");
      form.method = "POST";
      form.action = payhereUrl;

      const fields = {
        ...paymentRequest,
        hash: checksum,
      };

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      setDonationAmount("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Donation failed");
      setLoading(false);
    }
  };

  const totalDonated = donations
    .filter((d) => d.status === "SUCCESS")
    .reduce((sum, d) => sum + d.amount, 0);

  const successfulDonations = donations.filter(
    (d) => d.status === "SUCCESS",
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const currentUserEmail = localStorage.getItem("userEmail") || "Donor User";
  const userInitial = currentUserEmail.charAt(0).toUpperCase();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="dashboard-logo">
          <div className="logo-icon">❤️</div>
          <div className="logo-text">
            NGO<span className="highlight">Hub</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="nav-icon">📊</span>
            Overview
          </div>
          <div
            className={`nav-item ${activeTab === "donations" ? "active" : ""}`}
            onClick={() => setActiveTab("donations")}
          >
            <span className="nav-icon">💝</span>
            My Donations
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
            <h1 className="header-title">Donor Dashboard</h1>
            <p className="header-subtitle">
              Track your contributions and impact
            </p>
          </div>
          <div className="user-profile">
            <div className="user-avatar">{userInitial}</div>
            <div className="user-name">Donor</div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Registration Section */}
            {!registration ? (
              <div className="content-section" style={{ marginBottom: "40px" }}>
                <h2 className="section-title">📋 Complete Your Profile</h2>
                <p style={{ color: "#8b92a9", marginBottom: "24px" }}>
                  Help us know you better by completing your registration
                  information.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="Enter your phone number"
                      value={registrationData.phone}
                      onChange={(e) =>
                        setRegistrationData({
                          ...registrationData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Address *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter your address"
                      value={registrationData.address}
                      onChange={(e) =>
                        setRegistrationData({
                          ...registrationData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Information</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Any additional details you'd like to share (optional)"
                    value={registrationData.additionalInfo}
                    onChange={(e) =>
                      setRegistrationData({
                        ...registrationData,
                        additionalInfo: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleRegister}
                  disabled={registrationLoading}
                  style={{ opacity: registrationLoading ? 0.6 : 1 }}
                >
                  {registrationLoading
                    ? "Registering..."
                    : "✓ Complete Registration"}
                </button>
              </div>
            ) : (
              <div className="content-section" style={{ marginBottom: "40px" }}>
                <h2 className="section-title">📋 Your Profile</h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      padding: "20px",
                      background: "rgba(0, 212, 255, 0.05)",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 212, 255, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#8b92a9",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                      }}
                    >
                      📱 Phone
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#e8ebf0",
                        fontWeight: "600",
                      }}
                    >
                      {registration.phone}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "20px",
                      background: "rgba(0, 212, 255, 0.05)",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 212, 255, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#8b92a9",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                      }}
                    >
                      🏠 Address
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#e8ebf0",
                        fontWeight: "600",
                      }}
                    >
                      {registration.address}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "20px",
                      background: "rgba(0, 212, 255, 0.05)",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 212, 255, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#8b92a9",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                      }}
                    >
                      📅 Joined
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        color: "#e8ebf0",
                        fontWeight: "600",
                      }}
                    >
                      {new Date(registration.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {registration.additionalInfo && (
                  <div
                    style={{
                      marginTop: "20px",
                      padding: "16px",
                      background: "rgba(0, 212, 255, 0.05)",
                      borderRadius: "8px",
                      borderLeft: "3px solid #00d4ff",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#8b92a9",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                      }}
                    >
                      ℹ️ Additional Notes
                    </div>
                    <div style={{ color: "#e8ebf0" }}>
                      {registration.additionalInfo}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Donation Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Total Donated</div>
                <div className="metric-value">
                  ₹{totalDonated.toLocaleString()}
                </div>
                <div className="metric-change">
                  +₹
                  {donations.length > 0
                    ? (
                        totalDonated /
                          donations.filter((d) => d.status === "SUCCESS")
                            .length || 1
                      ).toFixed(0)
                    : "0"}{" "}
                  per donation
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Successful Donations</div>
                <div className="metric-value">{successfulDonations}</div>
                <div className="metric-change">
                  {donations.length > 0
                    ? ((successfulDonations / donations.length) * 100).toFixed(
                        0,
                      )
                    : "0"}
                  % success rate
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Total Transactions</div>
                <div className="metric-value">{donations.length}</div>
                <div className="metric-change">
                  {donations.filter((d) => d.status === "PENDING").length}{" "}
                  pending
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Average Donation</div>
                <div className="metric-value">
                  ₹
                  {donations.length > 0
                    ? (totalDonated / successfulDonations || 0).toFixed(0)
                    : "0"}
                </div>
                <div className="metric-change">Your typical gift size</div>
              </div>
            </div>

            {/* Make a Donation */}
            <div className="content-section">
              <h2 className="section-title">💰 Make a Donation</h2>
              <p style={{ color: "#8b92a9", marginBottom: "24px" }}>
                Your contribution directly supports our mission. Every rupee
                helps us create lasting change.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <label className="form-label">Donation Amount (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Enter amount"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    min="1"
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-end",
                  }}
                >
                  <button
                    className="btn btn-primary"
                    onClick={handleDonate}
                    disabled={loading}
                    style={{ flex: 1, opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? "Processing..." : "❤️ Donate Now"}
                  </button>
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  background: "rgba(74, 222, 128, 0.05)",
                  borderRadius: "6px",
                  border: "1px solid rgba(74, 222, 128, 0.2)",
                }}
              >
                <p style={{ fontSize: "13px", color: "#4ade80", margin: "0" }}>
                  ✓ Secure payment through PayHere | ✓ Your contribution is
                  tax-deductible
                </p>
              </div>
            </div>
          </>
        )}

        {/* Donations Tab */}
        {activeTab === "donations" && (
          <>
            {/* Donation Summary */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">💚 Total Contribution</div>
                <div className="metric-value">
                  ₹{totalDonated.toLocaleString()}
                </div>
                <div className="metric-change">Your impact</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">✓ Successful Gifts</div>
                <div className="metric-value">{successfulDonations}</div>
                <div className="metric-change">
                  {donations.length > 0
                    ? ((successfulDonations / donations.length) * 100).toFixed(
                        0,
                      )
                    : "0"}
                  % success
                </div>
              </div>
            </div>

            {/* Donation History Table */}
            <div className="content-section">
              <h2 className="section-title">💝 Your Donation History</h2>

              {donations.length > 0 ? (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Transaction ID</th>
                        <th>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation) => (
                        <tr key={donation.id}>
                          <td
                            style={{
                              fontWeight: "600",
                              color: "#00d4ff",
                              fontSize: "16px",
                            }}
                          >
                            ₹{donation.amount}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${donation.status.toLowerCase()}`}
                            >
                              {donation.status === "SUCCESS"
                                ? "✓ "
                                : donation.status === "PENDING"
                                  ? "⏳ "
                                  : "✗ "}
                              {donation.status}
                            </span>
                          </td>
                          <td
                            style={{
                              fontFamily: "monospace",
                              fontSize: "12px",
                              color: "#8b92a9",
                            }}
                          >
                            {donation.transactionId || "—"}
                          </td>
                          <td style={{ color: "#8b92a9", fontSize: "13px" }}>
                            {new Date(donation.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">💝</div>
                  <div className="empty-state-text">No donations yet</div>
                  <div className="empty-state-subtext">
                    Make your first donation to make a difference
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setActiveTab("overview")}
                    style={{ marginTop: "16px" }}
                  >
                    ❤️ Make Donation
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
