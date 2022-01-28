import { Button, Spinner, Textarea, ChakraProvider, VStack, Center, Heading, HStack } from '@chakra-ui/react'
import Feathers, { Paginated, Service } from '@feathersjs/feathers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Route, useParams, useNavigate, Link, Routes as RRoutes } from 'react-router-dom'
import { Query } from '../service'
import { feathersResultToArray } from '../util'
import { z, ZodObject } from 'zod'
import auth from '@feathersjs/authentication-client'
import rest from '@feathersjs/rest-client'
import axios from 'axios'

const superApp = <
    S extends {
        [K in string] : ZodObject<any>
    }
>(types : S) => {

    const feathers = Feathers<{
        [K in keyof S] : Service<z.infer<S[K]>>
    }>()

    feathers.configure(rest().axios(axios))
    feathers.configure(auth())

    const useFeathers = () => {
        return useMemo( () => {
            return feathers
        }, [] )
    }

    const useService = ( name : keyof S ) => {
        return useFeathers().service(name)        
    }

    type ViewOrEdit = ( { view : true, edit ?: false } | { edit : true, view?: false } )

    const services = Object.entries( types ).reduce<any>( (services, [name, type]) => {

        const service = feathers.service(name)
        type T = z.infer<typeof type>

        const List = ( query : Query<T> ) => {
            const [data, setData] = useState<T[] | Paginated<T>>()
            const [error, setError] = useState()
            const array = useMemo( () => data ? feathersResultToArray(data) : undefined, [data] )
            useEffect( () => {
                service.find({query}).then((res: any) => setData(res)).catch(setError)
            }, [query] )
            if ( error ) {
                console.error(error)
                return <>Error</>
            }
            if ( array )
                return (
                    <>
                        {array.map( (d : any) => (
                            <Link to={d.id} >{d.id}</Link>
                        ) )}
                    </>
                )
            return <Spinner/>
        }
        const Page = ( props : ViewOrEdit ) => {
            const { id } = useParams()
            const navigate = useNavigate()
            if ( ! id ) {
                navigate(-1)
                return null
            }
            return <Load id={id} {...props} />
        }
        const Load = ( { id, view, edit } : { id : string } & ViewOrEdit ) => {
            const [data, setData] = useState<T>()
            const [error, setError] = useState()
            useEffect( () => {
                service.get(id).then(setData).catch(setError)
            }, [id] )
            if ( error )
                return <>{error}</>
            if ( data )
                if ( view )
                    return <View {...data as any} />
                if ( edit )
                    return <Edit {...data as any } />
            return <Spinner/>
        }
        const View = ( props : T ) => {
            const json = useMemo( () => JSON.stringify(props, null, 4), [props] )
            return <Textarea disabled >{json}</Textarea>
        }
        const Edit = ( props : T ) => {
            const json = useMemo( () => JSON.stringify(props, null, 4), [props] )
            const [value, setValue] = useState(json)
            const [error, setError] = useState()

            const service = useService(name)

            const onClick = useCallback( () => {
                service.patch( (props as any).id, JSON.parse(value) )
                .then(res => setValue(JSON.stringify(res)))
                .catch(setError)
            }, [value] )

            if ( error ) {
                console.error(error)
                return <>Error</>
            }

            return (
                <>
                    <Textarea onChange={e => setValue(e.target.value)} >{value}</Textarea>
                    <Button onClick={onClick} >Save</Button>
                </>
            )
        }
        const Create = ( props : Partial<T> ) => {
            const json = useMemo( () => JSON.stringify(props, null, 4), [props] )
            const [value, setValue] = useState(json)
            const [error, setError] = useState()

            const navigate = useNavigate()

            const service = useService(name)

            const onClick = useCallback( () => {
                service.create( JSON.parse(value) )
                .then((res : any) => navigate(`${name}/${res.id}`))
                .catch(setError)
            }, [value] )

            if ( error ) {
                console.error(error)
                return <>Error</>
            }

            return (
                <>
                    <Textarea onChange={e => setValue(e.target.value)} >{value}</Textarea>
                    <Button onClick={onClick} >Save</Button>
                </>
            )
        }
        const Routes = () => {
            return (
                <RRoutes>
                    <Route path={`${name}`} element={<List/>} />
                    <Route path={`${name}/:id`} element={<Page view/>} />
                    <Route path={`${name}/edit/:id`} element={<Page edit/>} />
                    <Route path={`${name}/new`} element={<Create/>} />
                </RRoutes>
            )
        }

        services[name] = {
            List,
            Page,
            Load,
            View,
            Edit,
            Create,
            Routes
        }

        return services

    }, {} )

    const Home = () => (
        <VStack>
            {Object.keys(services).map( (name) => {
                return (
                    <HStack>
                        <Heading>{name}</Heading>
                        <Link to={`${name}/new`} >Create</Link>
                        <Link to={`${name}`} >List</Link>
                    </HStack>
                )
            })}
        </VStack>
    )

    const Router = () => {

        return (
            <BrowserRouter basename='/app' >
                <RRoutes>
                    <Route path='/' element={<Home/>} />                    
                </RRoutes>
                {Object.entries(services).map(( [name, {Routes}] : any ) => (
                    <Routes/>
                ))}

            </BrowserRouter>
        )
    }

    return services

    return () => {
        return (
            <ChakraProvider>
                <Center w='100%' h='100%'>
                    <Router/>
                </Center>
            </ChakraProvider>
        )
    }

}


const app = superApp( {
    'user' : z.object({ id: z.string(), email : z.string().email() })
} )