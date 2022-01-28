import { FC, useMemo } from 'react'
import { Select, SelectProps } from '@chakra-ui/react'
import { useFieldValue, useOnChange } from '../context'

export const SelectField: FC<{
    field : string
    options : { [value in string] : string } | string []
} & SelectProps> = ({
    field,
    options,
    ...props
}) => {
    const value = useFieldValue(field)
    const onChange = useOnChange(field)
    const isArray = useMemo( () => Array.isArray(options), [options] )
    return (
        <Select onChange={onChange} value={value} {...props}>
            {Object.entries(options).map( ([value, label]) => {
                return (
                    <option key={value} value={isArray ? label : value} >{label}</option>
                )
            })}
        </Select>
    )
}