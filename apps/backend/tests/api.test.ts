import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import express from "express";
import cors from "cors";
import routes from "../src/api/routes";
import type { Server } from "http";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", routes);

describe("API Endpoints & Edge Cases", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        const port = typeof address === "object" && address ? address.port : 3001;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it("GET /api/problems should return list of seeded problems", async () => {
    const res = await fetch(`${baseUrl}/api/problems`);
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(5);

    const parkingLot = body.find((p: any) => p.title.includes("Parking Lot"));
    expect(parkingLot).toBeDefined();
    expect(parkingLot.requirements.length).toBeGreaterThan(0);
    expect(parkingLot.constraints.length).toBeGreaterThan(0);
  });

  it("GET /api/problems/:id should return 404 for nonexistent problem", async () => {
    const res = await fetch(`${baseUrl}/api/problems/nonexistent-id-999`);
    expect(res.status).toBe(404);
    const body: any = await res.json();
    expect(body.error).toBe("Problem not found");
  });

  it("POST /api/attempts should reject requests missing required fields", async () => {
    const res = await fetch(`${baseUrl}/api/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error).toContain("required");
  });

  it("POST /api/attempts should create an attempt for a valid problem", async () => {
    const res = await fetch(`${baseUrl}/api/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId: "prob-1", userName: "Alex Learner" }),
    });

    expect(res.status).toBe(201);
    const body: any = await res.json();
    expect(body.id).toBeDefined();
    expect(body.problemId).toBe("prob-1");
    expect(body.status).toBe("IN_PROGRESS");
  });

  it("POST /api/attempts/:id/submit should reject empty submission content", async () => {
    const res = await fetch(`${baseUrl}/api/attempts/att-sample/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error).toBe("Content required");
  });

  it("POST /api/attempts/:id/submit should return 404 for invalid attempt", async () => {
    const res = await fetch(`${baseUrl}/api/attempts/invalid-attempt-id/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Some design content" }),
    });

    expect(res.status).toBe(404);
    const body: any = await res.json();
    expect(body.error).toBe("Attempt not found");
  });
});
