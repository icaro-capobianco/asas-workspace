import { z, ZodTypeAny } from 'zod'

type RunType = {
    zod : ZodTypeAny
    readable : boolean
    /** Not writeable */
    computed : boolean
}
