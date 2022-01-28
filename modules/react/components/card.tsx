import { Box, BoxProps } from "@chakra-ui/react"
import { useColors } from "../theming/hooks"
import { FC } from "react"

const Card : FC<BoxProps> = ({children, ...props}) => {
    const { bg, color } = useColors()
    return (
        <Box p={4} bg={bg} color={color} shadow='dark-lg' rounded={4} {...props} >
            {children}
        </Box>
    )
}

export default Card