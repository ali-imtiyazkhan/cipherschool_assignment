import { definePrismaConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config();

export default definePrismaConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: process.env.DATABASE_URL as string,
  },

  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});