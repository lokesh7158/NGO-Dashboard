import { useEffect, useState } from "react";
import API from "../api/api";

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
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationAmount, setDonationAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "donations">("overview");
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    phone: "",
    address: "",
    additionalInfo: "",
  });

  // Fetch user registration details
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

  // Fetch user donations when donations tab is active
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

  // Handle registration
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

  // Handle donation
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
      
      // Simulate payment gateway callback (in real scenario, this would be from gateway)
      const updatedRes = await API.post("/donation/callback", {
        donationId: res.data.donationId,
        status: "SUCCESS",
      });
      
      // Refresh donations list
      const donationsRes = await API.get("/donation/me");
      setDonations(donationsRes.data.donations);
      
      setDonationAmount("");
      alert("Donation successful! Thank you for your generous contribution.");
    } catch (err: any) {
      alert(err.response?.data?.message || "Donation failed");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total donated amount
  const totalDonated = donations
    .filter((d) => d.status === "SUCCESS")
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div
      style={{
        padding: "30px 20px",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "36px",
            marginBottom: "30px",
            background: "linear-gradient(135deg, #00d4ff 0%, #00f0ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          User Dashboard
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
          {(["overview", "donations"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
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
              {tab === "overview" ? "📊 Overview" : "📜 Donation History"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* Registration Section */}
            <div style={{ marginBottom: "40px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  marginBottom: "25px",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                📋 Registration Details
              </h2>
              {registration ? (
                <div
                  style={{
                    padding: "25px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #141928 0%, #1a2244 100%)",
                    border: "1px solid #2d3561",
                    boxShadow: "0 0 20px rgba(0, 212, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {[
                      { label: "📱 Phone", value: registration.phone },
                      { label: "🏠 Address", value: registration.address },
                      {
                        label: "📅 Registered On",
                        value: new Date(registration.createdAt).toLocaleDateString(),
                      },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <p
                          style={{
                            margin: "0 0 8px 0",
                            fontSize: "12px",
                            color: "#7a8ab3",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "16px",
                            color: "#ffffff",
                            fontWeight: "500",
                          }}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {registration.additionalInfo && (
                    <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #2d3561" }}>
                      <p
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "12px",
                          color: "#7a8ab3",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        ℹ️ Additional Info
                      </p>
                      <p style={{ margin: "0", color: "#ffffff" }}>
                        {registration.additionalInfo}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    padding: "30px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #2a1f0d 0%, #3a2a1a 100%)",
                    border: "1px solid #5a4a2a",
                    boxShadow: "0 0 20px rgba(255, 165, 0, 0.1)",
                  }}
                >
                  <p
                    style={{
                      marginBottom: "20px",
                      fontSize: "16px",
                      color: "#ffa500",
                    }}
                  >
                    ⚠️ You haven't registered yet. Please complete your registration.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={registrationData.phone}
                      onChange={(e) =>
                        setRegistrationData({ ...registrationData, phone: e.target.value })
                      }
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={registrationData.address}
                      onChange={(e) =>
                        setRegistrationData({ ...registrationData, address: e.target.value })
                      }
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Additional Info (Optional)"
                      value={registrationData.additionalInfo}
                      onChange={(e) =>
                        setRegistrationData({
                          ...registrationData,
                          additionalInfo: e.target.value,
                        })
                      }
                      style={{
                        padding: "12px 16px",
                        fontSize: "14px",
                      }}
                    />
                    <button
                      onClick={handleRegister}
                      disabled={registrationLoading}
                      style={{
                        padding: "12px 24px",
                        fontSize: "16px",
                        fontWeight: "600",
                        background: "linear-gradient(135deg, #00ff88 0%, #00cc66 100%)",
                        color: "#0a0e27",
                        border: "none",
                        borderRadius: "8px",
                        cursor: registrationLoading ? "not-allowed" : "pointer",
                        opacity: registrationLoading ? 0.6 : 1,
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!registrationLoading)
                          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                      }}
                    >
                      {registrationLoading ? "Registering..." : "✓ Complete Registration"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Donation Section */}
            <div>
              <h2
                style={{
                  fontSize: "24px",
                  marginBottom: "25px",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                💰 Make a Donation
              </h2>
              <div
                style={{
                  padding: "30px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #1a1f2e 0%, #242a3a 100%)",
                  border: "1px solid #2d3561",
                  boxShadow: "0 0 20px rgba(0, 212, 255, 0.1)",
                }}
              >
                <p
                  style={{
                    marginBottom: "25px",
                    fontSize: "16px",
                    color: "#7a8ab3",
                  }}
                >
                  Contribute to our cause with any amount. Every rupee helps us make a difference.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="number"
                    placeholder="Enter amount (₹)"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    min="1"
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      padding: "12px 16px",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  />
                  <button
                    onClick={handleDonate}
                    disabled={loading}
                    style={{
                      padding: "12px 28px",
                      fontSize: "16px",
                      fontWeight: "600",
                      background: "linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading)
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                    }}
                  >
                    {loading ? "Processing..." : "❤️ Donate Now"}
                  </button>
                </div>
                <p style={{ fontSize: "12px", color: "#7a8ab3", margin: "0" }}>
                  ✓ Secure payment processing | ✓ Tax receipt provided | ✓ Your donation makes an impact
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Donation History Tab */}
        {activeTab === "donations" && (
          <div>
            <h2
              style={{
                fontSize: "24px",
                marginBottom: "25px",
                color: "#ffffff",
              }}
            >
              📜 Donation History
            </h2>

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
                💚 Total Amount Donated
              </p>
              <h3
                style={{
                  margin: "0",
                  fontSize: "36px",
                  color: "#00ff88",
                  fontWeight: "700",
                }}
              >
                ₹{totalDonated.toLocaleString()}
              </h3>
            </div>

            {donations.length > 0 ? (
              <div
                style={{
                  borderRadius: "12px",
                  border: "1px solid #2d3561",
                  backgroundColor: "#141928",
                  overflowX: "auto",
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
                      {["Amount", "Status", "Transaction ID", "Date & Time"].map((header) => (
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
                    {donations.map((donation, idx) => (
                      <tr
                        key={donation.id}
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
                        <td
                          style={{
                            padding: "15px 16px",
                            color: "#00ff88",
                            fontWeight: "600",
                            fontSize: "16px",
                          }}
                        >
                          ₹{donation.amount}
                        </td>
                        <td
                          style={{
                            padding: "15px 16px",
                            fontWeight: "600",
                            color:
                              donation.status === "SUCCESS"
                                ? "#00ff88"
                                : donation.status === "FAILED"
                                  ? "#ff6b6b"
                                  : "#ffa500",
                          }}
                        >
                          {donation.status === "SUCCESS"
                            ? "✓ SUCCESS"
                            : donation.status === "FAILED"
                              ? "✗ FAILED"
                              : "⏳ PENDING"}
                        </td>
                        <td
                          style={{
                            padding: "15px 16px",
                            color: "#7a8ab3",
                            fontFamily: "monospace",
                            fontSize: "13px",
                          }}
                        >
                          {donation.transactionId || "—"}
                        </td>
                        <td
                          style={{
                            padding: "15px 16px",
                            color: "#7a8ab3",
                            fontSize: "13px",
                          }}
                        >
                          {new Date(donation.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  padding: "40px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#141928",
                  border: "1px solid #2d3561",
                  textAlign: "center",
              }}
              >
                <p
                  style={{
                    margin: "0",
                    fontSize: "18px",
                    color: "#7a8ab3",
                  }}
                >
                  💝 No donations yet. Make your first donation and make a difference!
                </p>
                <button
                  onClick={() => setActiveTab("overview")}
                  style={{
                    marginTop: "20px",
                    padding: "12px 24px",
                    fontSize: "15px",
                    fontWeight: "600",
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)",
                    color: "#ffffff",
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
                  ❤️ Donate Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
