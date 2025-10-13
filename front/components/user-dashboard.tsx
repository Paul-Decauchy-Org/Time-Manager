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

export function UserDashboard(
    {
    className,
    ...props
         }: React.ComponentProps<"div">) {
   const chartDataArrival = [
  { date: "10/11/2026", arrival: 20 },
  { date: "11/11/2026", arrival: 15 },
  { date: "12/11/2026", arrival: 15},
  { date: "14/11/2026", arrival: 12 },
  { date: "15/11/2026", arrival: 21 },
]     
const chartConfig = {
  desktop: {
    label: "retard accumulé",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
    <Card {...props} >
      <div className="grid grid-cols-2 gap-4 text-center">
      <Card >
      <CardHeader>
        <CardDescription >
          Heure d'arrivé
        </CardDescription>
      </CardHeader>
      <CardContent>
            <Field>
                <Button>clocking in</Button>
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
                <Button >clocking out</Button>
            </Field>
      </CardContent>
    </Card>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Line Chart</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartDataArrival}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
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
    </Card>
    </div>
  )
}
