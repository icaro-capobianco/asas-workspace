import { useEffect, useMemo } from 'react'

import { useContext } from 'asas-virtuais/modules/feathers/react/feathers'
import { useAsyncState } from 'asas-virtuais/modules/react/hooks'
import { Params } from 'asas-virtuais/modules/feathers/service'
import { Spinner } from '@chakra-ui/react'

type Props<T> = {
    service : string
    id : string
    params ?: Params<T>
}

export function useRetrieve<T extends any>( { service, id, params } : Props<T> ) {
    const { feathers } = useContext()
    const s = useMemo( () => feathers.service(service), [feathers, service] )
    return useAsyncState( s.get.bind(s), [id, params] )
}

type RetrieveProps<T> = Props<T> & { prop : keyof T }

export function Retrieve <T, >  ( { service, id, params, prop } : RetrieveProps<T> ) {

    const { resolved, rejected, loading, call } = useRetrieve<T>( {service, id, params} )
    useEffect( () => {
        call()
    }, [id] )
    return loading ? (
        <Spinner/>
    ) : resolved ? (
        <>{resolved?.[prop]}</>
    ) : rejected ? (
        <>Error</>
    ) : null 
}