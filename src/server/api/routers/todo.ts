import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { todoinput } from "~/types";

export const todoRouter = createTRPCRouter({

  all: protectedProcedure.query(async ({ ctx }) => {
    const Todolist = await ctx.db.todo.findMany({
      where: {
        userId: ctx.session.user.id
      }
    })
    return Todolist.map(({id, text, done}) => ({ id, text, done }));
  }),
  create: protectedProcedure.input(todoinput).mutation(({ ctx, input }) => {
    return ctx.db.todo.create({
      data: {
        text: input,
        user: {
          connect: {
            id: ctx.session.user.id,
          },
        },
      },
    });
  }),
  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.db.todo.delete({
      where: {
        id: input,
      }
    })
  }),
  toggle: protectedProcedure.input(z.object({
    id: z.string(),
    done: z.boolean(),
  })).mutation(({ ctx, input }) => {
    return ctx.db.todo.update({
      data: {
        done: input.done,
      },
      where: {
        id: input.id,
      }
    })
  })

});
