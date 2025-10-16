"use client"

import { Card } from "./ui/card"
import { useState } from "react"

export function Clock({
                        className,
                        ...props
    }: React.ComponentProps<"div">) {
         let time  = new Date().toLocaleTimeString()
         let date = new Date().toLocaleDateString()

  const [ctime,setTime] = useState(time)
  const [cdate, setDate] = useState(date)
  const UpdateTime=()=>{
    time =  new Date().toLocaleTimeString()
    date =  new Date().toLocaleDateString()
    setTime(time)
    setDate(date)
  }
  setInterval(UpdateTime)
    return(
        <Card className='text-center text-primary max-h-150px'  >
            <b style={{ fontSize:36 }}>{ctime}</b>
            {cdate}
        </Card>
    )
    
    
    
    }