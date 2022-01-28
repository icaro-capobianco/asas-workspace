import {
    Slider,
    SliderProps,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Box,
    HStack,
  } from '@chakra-ui/react'
import Duration from 'asas-virtuais/modules/react/components/Duration'
import { FC, useMemo } from 'react'

const DurationPicker : FC<SliderProps> = ( { onChange, onChangeEnd, value } ) => {
    return (
        <HStack spacing={8} >
            <Slider onChangeEnd={onChangeEnd} onChange={onChange} value={value} min={120} max={600} step={30}>
                <SliderTrack bg='red.100'>
                    <Box position='relative' right={10} />
                    <SliderFilledTrack/>
                </SliderTrack>
                <SliderThumb boxSize={6} />
            </Slider>
            <Box minW='70px' ><Duration minutes={value} /></Box>
        </HStack>
    )
}

export default DurationPicker