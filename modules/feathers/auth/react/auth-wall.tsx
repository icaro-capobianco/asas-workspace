import { Spinner } from '@chakra-ui/react'
import { FC } from 'react'
import { Navigate } from 'react-router-dom'
import { useContext } from './context'

const AuthWall : FC = ({ children }) => {
    const { loading, auth, routes } = useContext()

    if ( loading )
        return <Spinner/>

    if ( ! auth ) {
        return <Navigate to={ routes.login.path } />
    }

    if ( ! auth?.user?.isVerified ) {
        return <Navigate to={ routes.verify.path } />
    }

    return (
        <>{children}</>
    )
}

export default AuthWall