import { RadioProps, Radio } from '@chakra-ui/react'
import { get } from 'lodash'
import { FC, useMemo } from 'react'
import { useContext } from '../context'

export const RadioField: FC<{ field : string } & RadioProps> = ({
    field,
    ...props
}) => {
    const { value : target, setProp } = useContext()
    const value = useMemo(() => get( target, field ), [target, field])
    const checked = useMemo( () => value === true, [value] )
    return <Radio
        isChecked={checked}
        onChange={ e => setProp( field, e.target.value ) }
        {...props} />
}