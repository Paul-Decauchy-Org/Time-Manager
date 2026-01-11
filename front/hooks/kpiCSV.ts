import ExportCSV from "@/components/csv-export";
import { KpiCsvDocument } from "@/generated/graphql";
import { useQuery } from "@apollo/client/react";

export function useKpiCSV() {
    const {data, loading, error} = useQuery(KpiCsvDocument)
    return {
        data, loading, error
    }
}