"use client"

import { useQuery } from "@apollo/client/react"
import { TimeTableEntriesDocument } from "@/generated/graphql"

export function useTimeEntries() {
    const { data, loading, error, refetch } = useQuery(TimeTableEntriesDocument, {
        fetchPolicy: "network-only"
    })
    
    return {
        timeEntries: data?.timeTableEntries || [],
        loading,
        error,
        refetch
    }
}
