import express from "express";

const router = express.Router();

router.get("/signup", (req, res) => {
  res.send("Signup API");
});

router.get("/login", (req, res) => {
  res.send("Login API");
});

router.get("/logout", (req, res) => {
  res.send("Logout API");
});

export default router;
