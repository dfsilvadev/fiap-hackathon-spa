import * as yup from 'yup'
import { z } from 'zod'

/** Example using Zod. */
export const userSchemaZod = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export type UserZod = z.infer<typeof userSchemaZod>

/** Example using Yup. */
export const userSchemaYup = yup.object({
  name: yup.string().required().min(2),
  email: yup.string().required().email(),
})

export type UserYup = yup.InferType<typeof userSchemaYup>
