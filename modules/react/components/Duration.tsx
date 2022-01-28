import { useMemo } from 'react'

const Duration = ( { minutes : value } : {minutes : number} ) => {
    const d = useMemo( () => (value ?? 120) / 60, [value] )
    const hours = useMemo( () => Math.floor( d ), [d, value] )
    const minutes = useMemo( () => Number.isInteger( d ) ? '00m' : '30m', [d, value] )
    return (
        <>{hours}h {minutes}</>
    )
}
export default Duration