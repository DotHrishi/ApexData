const BASE_URL="http://127.0.0.1:8000/api/v1";

export async function getRace(year, round) {
    const response = await fetch(`${BASE_URL}/races/${year}/${round}`);

    if(!response.ok) {
        throw new Error("Failed to fetch race data");
    }

    return response.json();
}