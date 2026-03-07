// This file handles migrations and CLI configuration for Prisma 7
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: process.env["DATABASE_URL"],
        shadowDatabaseUrl: process.env["DATABASE_SHADOW_URL"],
    },
});
