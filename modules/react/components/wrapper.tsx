import { Container, VStack } from '@chakra-ui/react'
import { PiPiProvider, PiPiWrapper } from 'asas-virtuais/modules/react/components/PiPiWrapper'
import { FC } from 'react'

const Wrapper : FC = ( { children } ) => {
    return (
        <PiPiProvider colors={['blue', 'cyan', 'gray', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow']} patterns={['jigsaw', 'overcast', 'formal-invitation', 'topography', 'texture', 'jupiter', 'architect', 'cutout', 'hideout', 'graph-paper', 'yyy', 'squares', 'falling-triangles', 'piano-man', 'pie-factory', 'dominos', 'hexagons', 'charlie-brown', 'autumn', 'temple', 'stamp-collection', 'death-star', 'church-on-sunday', 'i-like-food', 'overlapping-hexagons', 'four-point-stars', 'bamboo', 'bathroom-floor', 'cork-screw', 'happy-intersection', 'kiwi', 'lips', 'lisbon', 'random-shapes', 'steel-beams', 'tiny-checkers', 'x-equals', 'anchors-away', 'bevel-circle', 'brick-wall', 'fancy-rectangles', 'heavy-rain', 'overlapping-circles', 'plus', 'rounded-plus-connected', 'volcano-lamp', 'wiggle', 'bubbles', 'cage', 'connections', 'current', 'diagonal-stripes', 'flipped-diamonds', 'floating-cogs', 'glamorous', 'houndstooth', 'leaf', 'lines-in-motion', 'moroccan', 'morphing-diamonds', 'rails', 'rain', 'skulls', 'squares-in-squares', 'stripes', 'tic-tac-toe', 'zig-zag', 'aztec', 'bank-note', 'boxes', 'circles-squares', 'circuit-board', 'curtain', 'diagonal-lines', 'endless-clouds', 'eyes', 'floor-tile', 'groovy', 'intersecting-circles', 'melt', 'overlapping-diamonds', 'parkay-floor', 'pixel-dots', 'polka-dots', 'signal', 'slanted-stars', 'wallpaper']}>
            <PiPiWrapper pb={'200px'} minH='100vh' >
                <Container maxW='container.xl' centerContent >
                    <VStack w='100%' >
                        {children}
                    </VStack>
                </Container>
            </PiPiWrapper>
        </PiPiProvider>
    )
}

export default Wrapper