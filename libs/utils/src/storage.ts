/**
 * Safely parses a JSON string.
 * Returns the default value if parsing fails or if the string is null/undefined.
 * 
 * @param jsonString The JSON string to parse
 * @param defaultValue The value to return if parsing fails
 * @returns The parsed object or the default value
 */
export const safeJSONParse = <T>(jsonString: string | null | undefined, defaultValue: T): T => {
    if (!jsonString) {
        return defaultValue;
    }
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return defaultValue;
    }
};
