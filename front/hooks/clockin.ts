"use client";

import {useMutation} from "@apollo/client/react";
import {ClockInDocument, Role} from "@/generated/graphql";

export function useClockIn(){
    const [clockInMutation, {  data, loading, error }] = useMutation(ClockInDocument)
    const clockIn = async() => {
        const result = await clockInMutation()
        return result.data
    }
 return {
    clockIn,
    data,
    loading,
    error
 }
}