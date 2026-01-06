import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Personality & Behavior
  personality: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreatePersonalityProfile } = await import('./db');
      return getOrCreatePersonalityProfile(ctx.user.id);
    }),
    
    updateConsent: protectedProcedure
      .input(z.object({ consentGiven: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        const { updatePersonalityProfile } = await import('./db');
        return updatePersonalityProfile(ctx.user.id, { consentGiven: input.consentGiven });
      }),
    
    analyzeSearchQuery: protectedProcedure
      .input(z.object({ query: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { analyzeTextForPersonality, mergePersonalityInsights } = await import('./gemini-analysis');
        const { getOrCreatePersonalityProfile, updatePersonalityProfile } = await import('./db');
        
        // Analyze the search query
        const insights = await analyzeTextForPersonality(input.query);
        
        // Get current profile
        const currentProfile = await getOrCreatePersonalityProfile(ctx.user.id);
        if (!currentProfile) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to get profile' });
        }
        
        // Merge insights with existing profile
        const merged = mergePersonalityInsights(currentProfile, insights, 0.2);
        
        // Update profile
        await updatePersonalityProfile(ctx.user.id, merged);
        
        return {
          insights,
          updatedProfile: merged,
        };
      }),
  }),

  // Products
  products: router({
    list: publicProcedure.query(async () => {
      const { getAllProducts } = await import('./db');
      return getAllProducts();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { getProductById } = await import('./db');
        return getProductById(input.id);
      }),
    
    getPersonalized: protectedProcedure.query(async ({ ctx }) => {
      const { getAllProducts, getProductPsychology, getOrCreatePersonalityProfile } = await import('./db');
      const { sortProductsByPersonality } = await import('./personality');
      
      const products = await getAllProducts();
      const userProfile = await getOrCreatePersonalityProfile(ctx.user.id);
      
      if (!userProfile) return products;
      
      // Get psychology data for all products
      const productsWithPsych = await Promise.all(
        products.map(async (p) => ({
          ...p,
          psychology: await getProductPsychology(p.id),
        }))
      );
      
      const sortedIds = sortProductsByPersonality(productsWithPsych, userProfile);
      
      // Reorder products based on personality match
      return sortedIds.map(id => products.find(p => p.id === id)!).filter(Boolean);
    }),
  }),

  // Cart
  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const { getCartItems } = await import('./db');
      return getCartItems(ctx.user.id);
    }),
    
    add: protectedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().default(1) }))
      .mutation(async ({ ctx, input }) => {
        const { addToCart } = await import('./db');
        return addToCart({ userId: ctx.user.id, ...input });
      }),
    
    update: protectedProcedure
      .input(z.object({ id: z.number(), quantity: z.number() }))
      .mutation(async ({ input }) => {
        const { updateCartItem } = await import('./db');
        return updateCartItem(input.id, input.quantity);
      }),
    
    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { removeFromCart } = await import('./db');
        return removeFromCart(input.id);
      }),
    
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      const { clearCart } = await import('./db');
      return clearCart(ctx.user.id);
    }),
  }),

  // Admin - Products
  admin: router({
    createProduct: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.string(),
        imageUrl: z.string().optional(),
        category: z.string().optional(),
        stock: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { createProduct } = await import('./db');
        return createProduct(input);
      }),
    
    updateProduct: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        imageUrl: z.string().optional(),
        category: z.string().optional(),
        stock: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { id, ...updates } = input;
        const { updateProduct } = await import('./db');
        return updateProduct(id, updates);
      }),
    
    updateProductPsychology: protectedProcedure
      .input(z.object({
        productId: z.number(),
        appealsToOpenness: z.number().min(0).max(100),
        appealsToConscientiousness: z.number().min(0).max(100),
        appealsToExtraversion: z.number().min(0).max(100),
        appealsToAgreeableness: z.number().min(0).max(100),
        appealsToNeuroticism: z.number().min(0).max(100),
        mianziScore: z.number().min(0).max(100).default(50),
        ubuntuScore: z.number().min(0).max(100).default(50),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        const { upsertProductPsychology } = await import('./db');
        return upsertProductPsychology(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
