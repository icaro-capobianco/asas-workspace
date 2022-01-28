import { SwitchProps, Switch } from '@chakra-ui/react'
import { get } from 'lodash'
import { FC, useMemo } from 'react'
import { useContext } from '../context'

export const SwitchField: FC<{ field : string } & SwitchProps> = ({
    field,
    ...props
}) => {
    const { value : target, setProp } = useContext()
    const value = useMemo(() => get( target, field ), [target, field])
    const checked = useMemo( () => value === true, [value] )
    return <Switch
        isChecked={checked}
        onChange={ e => setProp( field, e.target.checked ) }
        {...props} />
}