import { FC } from 'react'
import { Textarea, TextareaProps } from '@chakra-ui/react'
import { useFieldValue, useOnChange } from '../context'

export const TextareaField: FC<{ field : string } & TextareaProps> = ({
    field,
    ...props
}) => {
    const value = useFieldValue(field)
    const onChange = useOnChange(field)
    return <Textarea
        onChange={onChange}
        value={value}
        {...props}
    />
}