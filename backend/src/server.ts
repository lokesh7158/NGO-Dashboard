import app from "./app";

const PORT = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, "localhost", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
