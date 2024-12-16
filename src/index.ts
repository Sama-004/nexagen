import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

async function main() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  app.get("/", (req, res) => {
    res.send("Hello World");
  });
}

main().catch(console.error);
