import { FC } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

export const ServiceRouter : FC<{
    name : string
    List?: FC,
    View?: FC,
    Edit?: FC,
    Create?: FC
}> = ( {
    name,
    List,
    View,
    Edit,
    Create
} ) => {
    return (
        <BrowserRouter>
            <Routes>
                {List && (<Route path={`${name}`} element={<List/>} />)}
                {View && (<Route path={`${name}/:id`} element={<View/>} />)}
                {Edit && (<Route path={`${name}/edit/:id`} element={<Edit/>} />)}
                {Create && (<Route path={`${name}/new`} element={<Create/>} />)}
            </Routes>
        </BrowserRouter>
    )
}
