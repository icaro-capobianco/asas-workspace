import { useColorModeValue } from "@chakra-ui/react"

export const useColors = () => {
    const bg = useColorModeValue('white', 'black')
	const color = useColorModeValue('black', 'white')
    return {
        bg,
        color
    }
}

export const useBg = () => {
    return useColors().bg
}
export const useColor = () => {
    return useColors().color
}
