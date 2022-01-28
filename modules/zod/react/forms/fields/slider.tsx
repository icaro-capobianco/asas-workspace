import { Slider, SliderFilledTrack, SliderProps, SliderThumb, SliderTrack } from '@chakra-ui/react'
import { get } from 'lodash'
import { FC, useCallback, useMemo } from 'react'
import { useContext } from '../context'

export const SliderField: FC<{ field : string } & SliderProps> = ({
    field,
    ...props
}) => {
    const context = useContext()

    const value = useMemo(() => {
        return get( context.value, field )
    }, [get( context.value, field ), field, context.setProp])

    const onChangeEnd = useCallback( v => {
        context.setProp( field, v )
    }, [field, context.setProp] )

    return <Slider
        defaultValue={value}
        onChangeEnd={ onChangeEnd }
        {...props} 
    >
        <SliderTrack bg='red.100'>
        <SliderFilledTrack/>
        </SliderTrack>
        <SliderThumb boxSize={6} />
    </Slider>
}