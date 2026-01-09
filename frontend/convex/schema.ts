import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
    ...authTables,
    cvs: defineTable({
        userId: v.id("users"),
        title: v.string(),
        data: v.any(),
        isActive: v.boolean(),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_user", ["userId"]),
});

export default schema;
