import { FC } from 'react'
import { Alert as CAlert, AlertDescription, AlertIcon, AlertProps, AlertTitle } from '@chakra-ui/react'

type Props = AlertProps & {
    title ?: string
    icon ?: boolean
}

const Alert : FC<Props> = ( {
    icon = true,
    title,
    children,
    ...props
} ) => (
    <CAlert {...props} >
        {icon && <AlertIcon/>}
        {title && (<AlertTitle>{title}</AlertTitle>)}
        <AlertDescription>{children}</AlertDescription>
    </CAlert>
)

export default Alert