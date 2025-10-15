import { Clock } from "@/components/clock"
import { ClockIn} from "@/components/clock-in"
import { ClockOut} from "@/components/clock-out"


export default function Page() {

    return (
        <div>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                            <ClockIn/>
                            <ClockOut/>
                            <Clock/>
                        </div>
                        
                        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
                    </div>
        </div>
    )
}