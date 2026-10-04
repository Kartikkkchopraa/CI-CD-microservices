const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const HOSTNAME = process.env.HOSTNAME || require("os").hostname();
const TAX_SERVICE_URL = process.env.TAX_SERVICE_URL || "http://service-b:4000";

//the default http://service-b:4000 will only work if the container name is service-b because when we create a shared network the container can contact each other with their container name and container poort

// CORS (must come before routes)
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:32000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // mobile/curl
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS blocked"));
  }
}));

// Route

// in the ingress we defined /api path and we were getting an error that the reques is not reaching the backend because our route is defined for /price now we changed our root to /api/price to fix the error 

//first we thought it was a cors issue but since the origin that it load balancer of ingress is same for backend and frontend so it was not a cors issue

app.get("/api/price", async (req, res) => {
  const amount = Number(req.query.amount || 0);
  const country = (req.query.country || "DEFAULT").toUpperCase();

  const r = await axios.get(`${TAX_SERVICE_URL}/tax?country=${country}`);
  const tax = Number(r.data.tax);

  res.json({
    service: "A",
    amount,
    tax,
    total: amount + tax,
    container: HOSTNAME,
    service_b_container: r.data.container
  });
});

app.listen(3000, () => console.log("Service A running on 3000"));
