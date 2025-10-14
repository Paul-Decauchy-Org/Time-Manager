"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field
} from "@/components/ui/field"
import { cn } from "@/lib/utils"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import React, { ButtonHTMLAttributes, use } from "react"
import { useClockIn} from "@/hooks/clockin";

export function UserDashboard(
    {
    className,
    ...props
         }: React.ComponentProps<"div">) {
  const {clockIn, loading, error} = useClockIn()
   const chartDataArrival = [
  { date: "10/11/2026", arrival: 20},
  { date: "11/11/2026", arrival: 15 },
  { date: "12/11/2026", arrival: 15},
  { date: "14/11/2026", arrival: 12 },
  { date: "15/11/2026", arrival: 21 },
]     
const chartDataDeparture = [
  { date: "10/11/2026", departure: 30},
  { date: "11/11/2026", departure: 5 },
  { date: "12/11/2026", departure: 4},
  { date: "14/11/2026", departure: 21 },
  { date: "15/11/2026", departure: 49 },
]
const chartConfig = {
  desktop: {
    label: "retard accumulé",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig
const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) =>{
  const userId = 1 //TODO dynamically get the userID
  try {
    const clocking = await clockIn( {userId})
  }
  catch (err){
    console.log("clockin failed", err)
  }
}
  return (
    <div className={cn("@container/card", className)} {...props}>
    <Card {...props} style={{width: '100vh', height: '90vh'}} >
      <div className="grid grid-cols-2 gap-4 text-center">
      <Card >
      <CardHeader>
        <CardDescription >
          Heure d'arrivé
        </CardDescription>
      </CardHeader>
      <CardContent>
            <Field>
                <Button style={{color: 'white'}} onClick={handleClick} >clocking in</Button>
            </Field>
      </CardContent>
      </Card>
      <Card>
      <CardHeader>
        <CardDescription>
            Heure de départ
        </CardDescription>
  
      </CardHeader>
      <CardContent>
            <Field>
                <Button style={{color: 'white' }} >clocking out</Button>
            </Field>
      </CardContent>
    </Card>
    </div>
    <div className="grid grid-cols-2 gap-4 text-center">
    <Card>
      <CardHeader>
        <CardTitle>heure d'arrivé</CardTitle>
        <CardDescription>Last week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartDataArrival}
             margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 5)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="arrival"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>heure de départ</CardTitle>
        <CardDescription>Last week</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartDataDeparture}
             margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 5)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="departure"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
    </div>
    </Card>
    </div>
  )
}
