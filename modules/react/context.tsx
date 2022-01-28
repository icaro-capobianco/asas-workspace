import { createContext } from "@chakra-ui/react-utils"
import { FC } from "react"

export type HookProps<H> = H extends ( props : infer P ) => any ? P : never

export const makeHookContext = <
    H extends <T = any>( props : any ) => any,
>( useHook : H, name : string = 'None Given' ) => {
    type P = HookProps<H>
    type R = ReturnType<H>

    const [
		ContextProvider,
		useContext,
        context
	] = createContext<R>({
        errorMessage: `Outside of context of: ${name}`
    })

    const Provider : FC<Partial<P>> = ( { children, ...props } ) => {
		const ctx = useHook(props)
		return (
            <ContextProvider value={ctx} >
                {children}
            </ContextProvider>
        )
	}
    return {
        useContext,
        Provider,
        ContextProvider,
        context
    }
}
