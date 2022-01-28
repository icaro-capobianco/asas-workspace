import { FC } from 'react'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import { useContext } from './context'

const Router : FC = () => {
    const { routes } = useContext()
    const login = routes.login 
    const register = routes.register
    const verify = routes.verify
    return (
        <Routes>
            <Route path={login.path} element={login.el} />
            <Route path={register.path} element={register.el} />
            <Route path={register.path} element={register.el} />
            <Route path={verify.path} element={verify.el} />
        </Routes>
    )
}
export default Router