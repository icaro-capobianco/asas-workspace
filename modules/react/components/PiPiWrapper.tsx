import PillPity, { PillPityProps } from 'pill-pity'
import { FC, ReactElement, useCallback, useState } from 'react'
import { createContext } from '@chakra-ui/react-utils'
import { IconButton, Tooltip, useColorMode, useColorModeValue } from '@chakra-ui/react'

import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { FaHome } from 'react-icons/fa'
import { GiSpellBook } from 'react-icons/gi'
import { useNavigate } from 'react-router-dom'
import { useBg } from '../theming/hooks'

export const patterns = [
	'jigsaw',
	'overcast',
	'formal-invitation',
	'topography',
	'texture',
	'jupiter',
	'architect',
	'cutout',
	'hideout',
	'graph-paper',
	'yyy',
	'squares',
	'falling-triangles',
	'piano-man',
	'pie-factory',
	'dominos',
	'hexagons',
	'charlie-brown',
	'autumn',
	'temple',
	'stamp-collection',
	'death-star',
	'church-on-sunday',
	'i-like-food',
	'overlapping-hexagons',
	'four-point-stars',
	'bamboo',
	'bathroom-floor',
	'cork-screw',
	'happy-intersection',
	'kiwi',
	'lips',
	'lisbon',
	'random-shapes',
	'steel-beams',
	'tiny-checkers',
	'x-equals',
	'anchors-away',
	'bevel-circle',
	'brick-wall',
	'fancy-rectangles',
	'heavy-rain',
	'overlapping-circles',
	'plus',
	'rounded-plus-connected',
	'volcano-lamp',
	'wiggle',
	'bubbles',
	'cage',
	'connections',
	'current',
	'diagonal-stripes',
	'flipped-diamonds',
	'floating-cogs',
	'glamorous',
	'houndstooth',
	'leaf',
	'lines-in-motion',
	'moroccan',
	'morphing-diamonds',
	'rails',
	'rain',
	'skulls',
	'squares-in-squares',
	'stripes',
	'tic-tac-toe',
	'zig-zag',
	'aztec',
	'bank-note',
	'boxes',
	'circles-squares',
	'circuit-board',
	'curtain',
	'diagonal-lines',
	'endless-clouds',
	'eyes',
	'floor-tile',
	'groovy',
	'intersecting-circles',
	'melt',
	'overlapping-diamonds',
	'parkay-floor',
	'pixel-dots',
	'polka-dots',
	'signal',
	'slanted-stars',
	'wallpaper'
] as const

export const MyIconButtonTooltip: FC<{
	label: string
	onClick: (...p: any[]) => any
	icon: ReactElement
}> = ({ label, onClick, icon }) => {

	const bg= useBg()

	return (
		<Tooltip label={label}>
			<IconButton
				bg={bg}
				size='md'
				fontSize='lg'
				aria-label={label}
				variant='solid'
				color='current'
				shadow='md'
				onClick={onClick}
				icon={icon}
				/>
		</Tooltip>
	)
} 

	

export const HomeButton = () => {
	const navigate = useNavigate()
	const routeHome = useCallback(() => navigate('/'), [history])
	return <MyIconButtonTooltip label='Return to the home page' onClick={routeHome} icon={<FaHome />} />
}

export const CastSpell = () => {
	const { randomize } = usePiPiContext()
	return <MyIconButtonTooltip label={`Cast a spell`} onClick={randomize} icon={<GiSpellBook />} />
}

export const ColorMode = () => {
	const SwitchIcon = useColorModeValue(MoonIcon, SunIcon)
	const { toggleColorMode } = useColorMode()
	const text = useColorModeValue('dark', 'light')
	return <MyIconButtonTooltip label={`Switch to ${text} mode`} onClick={toggleColorMode} icon={<SwitchIcon />} />
}

export const usePiPi = (options: readonly string[], colors : string[]) => {
	const [pattern, setPattern] = useState<string>(getRandomArrayItem(options as unknown as any) as any)
	const [color, setColor] = useState(
		getRandomArrayItem(colors)
	)

	const randomize = useCallback(() => {
		setPattern(getRandomArrayItem(options as unknown as any) as any)
		setColor(getRandomArrayItem(colors))
	}, [])
	return {
		randomize,
		color,
		pattern
	}
}
export const [PPContextProvider, usePiPiContext] = createContext<
	ReturnType<typeof usePiPi>
>()

export const getRandomArrayItem = function<T>(x: T[]) {
	if ( x.length === 1 ) {
		return x[0]
	}
	return x[Math.round(Math.random() * x.length)] as T
}

export const PiPiWrapper : FC<PillPityProps> = ({ children, ...props }) => {
	const pp = usePiPiContext()
	const { pattern, color } = pp
	return (
		<PillPity
			pattern={pattern as any}
			pill={color}
			{...props}
		>
			{children}
		</PillPity>
	)	
}

export const PiPiProvider: FC<{ colors : string[], patterns : typeof patterns[number][] }> = ({ children, colors, patterns : p = patterns }) => {
	const pp = usePiPi(p, colors)
	return (
		<PPContextProvider value={pp}>
			{children}
		</PPContextProvider>
	)
}
