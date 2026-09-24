import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react"

export function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="ui-field"><span>{label}</span><input {...props} /></label>
}

export function Select({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return <label className="ui-field"><span>{label}</span><select {...props}>{children}</select></label>
}
