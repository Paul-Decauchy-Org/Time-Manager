"use client";

import {useMutation} from "@apollo/client/react";
import {ClockinDocument, Role} from "@/generated/graphql";

export function useClockIn(){
    const [clockInMutation, {  data, loading, error }] = useMutation(ClockinDocument)
    const clockIn = async( input: {
        userId: number

    }) => {
        const result = await clockInMutation()
        return result.data?
    }
 return {
    clockIn,
    data,
    loading,
    error
 }
}