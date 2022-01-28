import axios from 'axios'

import feathers from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'

import { FC  } from 'react'
import { Routes, Route, Link, BrowserRouter } from 'react-router-dom'

import { Service } from 'asas-virtuais/modules/feathers/service'
import { Button, ChakraProvider, Heading, HStack, SimpleGrid, VStack } from '@chakra-ui/react'
import Wrapper from 'asas-virtuais/modules/react/components/wrapper'

type TypeMap = {
    [S : string] : unknown
}

type Pages = {
    list : FC
    view : FC
    edit : FC
    create : FC
}

function asas<S extends TypeMap>( names : Array<keyof S>, pages: { [K in keyof S]: Pages } ) {

    type K = keyof S

    const app = feathers<Services>().configure(rest().axios(axios))

    /** Extract Services */
    type Services = { [N in K]: Service<S[N]> }
    const services : Services = names.reduce<Services>( (services, name : K ) => {
        services[name] = app.service(name)
        return services
    }, {} as Services )

    /** Routes with React Router V6 */
    type Routes = { [N in K]: FC }
    const routes : Routes = names.reduce<Routes>( (routes, name : K) => {

        const View = pages[name].view
        const List = pages[name].list
        const Edit = pages[name].edit
        const Create = pages[name].create

        const path = name as string
        routes[name] = () => {
            return (
                <Routes>
                    {/* List */}
                    <Route path={`${path}`} element={<List/>} />
                    {/* View */}
                    <Route path={`${path}/:id`} element={<View/>} />
                    {/* Edit */}
                    <Route path={`${path}/edit/:id`} element={<Edit/>} />
                    {/* Create */}
                    <Route path={`${path}/new`} element={<Create/>} />
                </Routes>
            )
        }
        return routes
    }, {} as Routes )


    type Links = { [N in K]: { List : FC, View : FC, Edit : FC, Create : FC } }
    const links : Links = names.reduce<Links>( ( links, name : K ) => {
        const path = name as string
        links[name] = {
            List : () =>   <Link to={`/${path}`} ><Button>LIST</Button></Link>,
            View : () =>   <Link to={`/${path}/:id`} ><Button>VIEW</Button></Link>,
            Edit : () =>   <Link to={`/${path}/edit/:id`} ><Button>EDIT</Button></Link>,
            Create : () => <Link to={`/${path}/new`} ><Button>CREATE</Button></Link>,
        }
        return links
    }, {} as Links )

    const ServiceRoutes = () => (
        <>
            {Object.values( routes ).map( (Routes, i) => (
                <Routes key={i} />
            ))}
        </>
    )

    const Explorer = () => (
        <SimpleGrid columns={4}  >
            {Object.entries(links).map( ([name, { List, View, Edit, Create }]) => (
                <VStack key={name} >
                    <Heading size='md' >Service: {name}</Heading>
                    <HStack >
                        <List/>   <View/>   <Edit/>   <Create/>
                    </HStack>
                </VStack>
            ))}
        </SimpleGrid>
    )

    const Debug = () => (
        <ChakraProvider>
            <Wrapper>
                <BrowserRouter basename='/app' >
                    <Routes>
                        <Route path='/' element={<Explorer/>} />
                    </Routes>
                    <ServiceRoutes/>
                </BrowserRouter>
            </Wrapper>
        </ChakraProvider>
    )

    return {
        app,
        services,
        routes,
        links,
        Debug
    }

}

export default asas
