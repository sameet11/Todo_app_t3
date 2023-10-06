import {z} from 'zod';

import { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from './server/api/root';

type routeroutput=inferRouterOutputs<AppRouter>;
type alltodosoutput=routeroutput["todo"]["all"];
 export type todo=alltodosoutput[number];
 export const todoinput=z.string({
    required_error:'describe your todo',
})
.min(1)
.max(50)