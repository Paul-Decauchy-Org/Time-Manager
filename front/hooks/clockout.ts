"use client";

import {useMutation} from "@apollo/client/react";
import {ClockOutDocument, Role} from "@/generated/graphql";

export function useClockOut(){
    const [clockOutMutation, {  data, loading, error }] = useMutation(ClockOutDocument)
    const clockOut = async() => {
        const result = await clockOutMutation()
        return result.data
    }
 return {
    clockOut,
    data,
    loading,
    error
 }
}