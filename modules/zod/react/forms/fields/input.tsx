import { FC } from 'react'
import { Input, InputProps } from '@chakra-ui/react'
import { useFieldValue, useOnChange } from '../context'

export const InputField: FC<{ field : string } & InputProps> = ({
    field,
    ...props
}) => {
    const value = useFieldValue(field)
    const onChange = useOnChange(field)
    return <Input
        onChange={onChange}
        value={value}
        {...props}
    />
}