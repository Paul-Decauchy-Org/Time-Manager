"use client"



import { cn } from "@/lib/utils"

import React, { ButtonHTMLAttributes, use } from "react"
import { useClockIn} from "@/hooks/clockin";
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { Field } from "./ui/field";

export function ClockIn(
    {
    className,
    ...props
         }: React.ComponentProps<"div">) {
              const {clockIn, loading, error} = useClockIn()
            
             const handleClockIn =async (e: React.MouseEvent<HTMLButtonElement>) =>{
               try {
               await clockIn()
               console.log("clock in success")
               }
               catch (err){
                 console.log("clockin failed", err)
               }
             }

            return (
                <div className={cn("@container/card", className)} {...props}>
                        <Card style={{minHeight:150}} >
                        <CardHeader>
                            
                        </CardHeader>
                        <CardContent>
                            <Field>
                                <Button style={{color: 'white'}} onClick={handleClockIn} >Commencer ma journée</Button>
                            </Field>
                        </CardContent>
                        </Card>
                </div>
            )


         }