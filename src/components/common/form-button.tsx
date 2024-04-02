'use client'

import { useFormStatus } from "react-dom"
import { Button } from "@nextui-org/react"

interface FormButtonProps {
  children: React.ReactNode;
}
const FormButton = ({children}: FormButtonProps) => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending}>{children}</Button>
  )
}

export default FormButton
