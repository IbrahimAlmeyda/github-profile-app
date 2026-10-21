import { useEffect, useState } from "react"
import { githubApi } from "../services/githubApi";
import { mapUsersData } from "../utils/mappers";
import { UsersMapped } from "../types/types";

const DEBOUNCE_MS = 500;

export const usePotencialProfile = (search: string) => {
    const [potencialProfiles, setPotencialProfiles] = useState<UsersMapped[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (search.length < 3) {
            setPotencialProfiles(null);
            return;
        }

        // Evita lanzar una petición por cada letra y descarta respuestas de búsquedas obsoletas.
        let isCurrent = true;

        const timeoutId = setTimeout(async () => {
            try {
                const response = await githubApi.searchUsers(search, 3);
                if (!response.ok) throw new Error("Ocurrio un error inesperado.");

                const profiles = await response.json();
                if (!isCurrent) return;
                setError(null);
                setPotencialProfiles(mapUsersData(profiles.items));
            } catch (error) {
                if (!isCurrent) return;
                setError(error instanceof Error ? error.message : "Ocurrio un error inesperado.");
            }
        }, DEBOUNCE_MS);

        return () => {
            isCurrent = false;
            clearTimeout(timeoutId);
        };
    }, [search])

    return {potencialProfiles, setPotencialProfiles, error}
}