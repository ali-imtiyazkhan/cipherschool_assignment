import express from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";

const app = express();

app.use(express.json());

type User = {
    id: string;
    username: string;
    email: string;
    token?: string;
};

const users: User[] = [];

app.post("/signup", (req, res) => {

    const { username, email } = req.body;

    if (!username || !email) {
        return res
            .status(400)
            .json({ error: "Username and email are required" });
    }

    const existingUser = users.find(
        (user) => user.email === email
    );

    if (existingUser) {
        return res
            .status(400)
            .json({ error: "User already exists" });
    }

    const newUser = {
        id: Math.random().toString(36).substring(2, 15),
        username,
        email
    };

    const token = jwt.sign(
        { userEmail: email },
        "secret",
        { expiresIn: "1h" }
    );

    users.push({
        ...newUser,
        token
    });

    return res
        .status(201)
        .json({
            message: "User created successfully",
            token
        });
});

app.post("/payment", authMiddleware, (req, res) => {
    const { amount } = req.body;
    if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
    }
    return res.status(200).json({ message: "Payment successful", amount });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});