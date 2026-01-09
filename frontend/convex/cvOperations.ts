import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const getMyCVs = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        const cvs = await ctx.db
            .query("cvs")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        return cvs.sort((a, b) => b.updatedAt - a.updatedAt);
    },
});

export const getCV = query({
    args: { cvId: v.id("cvs") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const cv = await ctx.db.get(args.cvId);
        if (!cv || cv.userId !== userId) return null;

        return cv;
    },
});

export const createCV = mutation({
    args: {
        title: v.string(),
        data: v.any(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const now = Date.now();
        const cvId = await ctx.db.insert("cvs", {
            userId,
            title: args.title,
            data: args.data,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });

        return cvId;
    },
});

export const updateCV = mutation({
    args: {
        cvId: v.id("cvs"),
        title: v.optional(v.string()),
        data: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const cv = await ctx.db.get(args.cvId);
        if (!cv || cv.userId !== userId) throw new Error("CV not found");

        await ctx.db.patch(args.cvId, {
            ...(args.title !== undefined && { title: args.title }),
            ...(args.data !== undefined && { data: args.data, updatedAt: Date.now() }),
            updatedAt: Date.now(),
        });

        return args.cvId;
    },
});

export const deleteCV = mutation({
    args: { cvId: v.id("cvs") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const cv = await ctx.db.get(args.cvId);
        if (!cv || cv.userId !== userId) throw new Error("CV not found");

        await ctx.db.delete(args.cvId);
        return true;
    },
});

export const duplicateCV = mutation({
    args: { cvId: v.id("cvs") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const cv = await ctx.db.get(args.cvId);
        if (!cv || cv.userId !== userId) throw new Error("CV not found");

        const now = Date.now();
        const newCvId = await ctx.db.insert("cvs", {
            userId,
            title: `${cv.title} (copia)`,
            data: cv.data,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });

        return newCvId;
    },
});
