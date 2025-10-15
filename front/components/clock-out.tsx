"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import {
  Field
} from "@/components/ui/field"
import { cn } from "@/lib/utils"

import React, { ButtonHTMLAttributes, use } from "react"
import {  useClockOut} from "@/hooks/clockout"

export function ClockOut(
    {
    className,
    ...props
         }: React.ComponentProps<"div">) {
            const {clockOut ,loading, error} = useClockOut()
            const handleClockOut =async (e: React.MouseEvent<HTMLButtonElement>) =>{
                try {
                    await clockOut()
                    console.log("clock in success")
                }
                catch (err){
                    console.log("clockin failed", err)
                }
            }
            return (
                <div className={cn("@container/card", className)} {...props}>
                    <Card style={{minHeight:150}}>
                        <CardHeader>
                            <CardDescription >
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Field>
                                <Button style={{color: 'white'}} onClick={handleClockOut} > Finir ma journée</Button>
                            </Field>
                        </CardContent>
                    </Card>
                </div>
                        )
         }
