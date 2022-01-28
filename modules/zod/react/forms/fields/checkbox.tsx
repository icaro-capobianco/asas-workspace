import { CheckboxProps, Checkbox } from '@chakra-ui/react'
import { get } from 'lodash'
import { FC, useMemo } from 'react'
import { useContext } from '../context'

export const CheckboxField: FC<{ field : string } & CheckboxProps> = ({
    field,
    ...props
}) => {
    const { value : target, setProp } = useContext()
    const value = useMemo(() => get( target, field ), [target, field])
    const checked = useMemo( () => value === true, [value] )
    return <Checkbox
        isChecked={checked}
        onChange={ e => setProp( field, e.target.value ) }
        {...props} />
}